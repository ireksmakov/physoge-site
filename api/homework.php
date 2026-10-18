<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

function respond(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_text($value, int $max): string {
    $value = trim((string)$value);
    $value = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $value) ?? '';
    if (function_exists('mb_substr')) return mb_substr($value, 0, $max, 'UTF-8');
    return substr($value, 0, $max);
}

function normalize_answer($value): string {
    return preg_replace('/\s+/u', '', trim((string)$value)) ?? '';
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['ok' => false, 'error' => 'method_not_allowed'], 405);
}

$input = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($input)) respond(['ok' => false, 'error' => 'invalid_json'], 400);

$action = clean_text($input['action'] ?? '', 40);
$dataPath = getenv('FIZMAT_HOMEWORK_DATA') ?: '/var/tmp/fizmat-course-homework.json';
$dir = dirname($dataPath);
if (!is_dir($dir) || !is_writable($dir)) {
    respond(['ok' => false, 'error' => 'storage_unavailable'], 500);
}

$fh = @fopen($dataPath, 'c+');
if (!$fh) respond(['ok' => false, 'error' => 'storage_open_failed'], 500);
if (!flock($fh, LOCK_EX)) {
    fclose($fh);
    respond(['ok' => false, 'error' => 'storage_lock_failed'], 500);
}

rewind($fh);
$raw = stream_get_contents($fh);
$db = $raw ? json_decode($raw, true) : null;
if (!is_array($db)) $db = [];
if (!isset($db['teachers']) || !is_array($db['teachers'])) $db['teachers'] = [];
if (!isset($db['assignments']) || !is_array($db['assignments'])) $db['assignments'] = [];
if (!isset($db['attempts']) || !is_array($db['attempts'])) $db['attempts'] = [];

$dirty = false;
$result = null;
$status = 200;

if ($action === 'create_teacher') {
    $teacherKey = bin2hex(random_bytes(24));
    $db['teachers'][$teacherKey] = [
        'createdAt' => gmdate('c')
    ];
    $dirty = true;
    $result = ['ok' => true, 'teacherKey' => $teacherKey];
} elseif ($action === 'ensure_assignment') {
    $teacherKey = clean_text($input['teacherKey'] ?? '', 96);
    if (!$teacherKey || !isset($db['teachers'][$teacherKey])) {
        $result = ['ok' => false, 'error' => 'teacher_key_invalid'];
        $status = 403;
    } else {
        $assignmentId = clean_text($input['assignmentId'] ?? '', 80);
        $title = clean_text($input['title'] ?? 'Домашнее задание', 160);
        $correctAnswer = normalize_answer($input['correctAnswer'] ?? '');
        if (!$assignmentId || !$correctAnswer) {
            $result = ['ok' => false, 'error' => 'assignment_invalid'];
            $status = 400;
        } else {
            $foundToken = '';
            foreach ($db['assignments'] as $token => $assignment) {
                if (($assignment['teacherKey'] ?? '') === $teacherKey && ($assignment['assignmentId'] ?? '') === $assignmentId) {
                    $foundToken = (string)$token;
                    break;
                }
            }
            if (!$foundToken) {
                $foundToken = bin2hex(random_bytes(18));
                $db['assignments'][$foundToken] = [
                    'teacherKey' => $teacherKey,
                    'assignmentId' => $assignmentId,
                    'title' => $title,
                    'correctAnswer' => $correctAnswer,
                    'createdAt' => gmdate('c')
                ];
                $dirty = true;
            }
            $result = [
                'ok' => true,
                'assignmentToken' => $foundToken,
                'assignmentId' => $assignmentId,
                'title' => $db['assignments'][$foundToken]['title'] ?? $title
            ];
        }
    }
} elseif ($action === 'submit') {
    $token = clean_text($input['assignmentToken'] ?? '', 96);
    $assignment = $token && isset($db['assignments'][$token]) ? $db['assignments'][$token] : null;
    if (!$assignment) {
        $result = ['ok' => false, 'error' => 'assignment_token_invalid'];
        $status = 403;
    } else {
        $studentName = clean_text($input['studentName'] ?? '', 120);
        $className = clean_text($input['className'] ?? '', 40);
        $answer = normalize_answer($input['answer'] ?? '');
        $consent = !empty($input['consent']);
        if (!$studentName || !$answer || !$consent) {
            $result = ['ok' => false, 'error' => 'student_data_incomplete'];
            $status = 400;
        } else {
            $correct = hash_equals((string)$assignment['correctAnswer'], $answer);
            $attempt = [
                'id' => bin2hex(random_bytes(10)),
                'assignmentToken' => $token,
                'assignmentId' => $assignment['assignmentId'] ?? '',
                'teacherKey' => $assignment['teacherKey'] ?? '',
                'studentName' => $studentName,
                'className' => $className,
                'answer' => $answer,
                'correct' => $correct,
                'createdAt' => gmdate('c')
            ];
            $db['attempts'][] = $attempt;
            if (count($db['attempts']) > 20000) $db['attempts'] = array_slice($db['attempts'], -20000);
            $dirty = true;
            $result = [
                'ok' => true,
                'correct' => $correct,
                'attemptId' => $attempt['id'],
                'createdAt' => $attempt['createdAt']
            ];
        }
    }
} elseif ($action === 'stats') {
    $teacherKey = clean_text($input['teacherKey'] ?? '', 96);
    if (!$teacherKey || !isset($db['teachers'][$teacherKey])) {
        $result = ['ok' => false, 'error' => 'teacher_key_invalid'];
        $status = 403;
    } else {
        $assignments = [];
        $validTokens = [];
        foreach ($db['assignments'] as $token => $assignment) {
            if (($assignment['teacherKey'] ?? '') !== $teacherKey) continue;
            $validTokens[(string)$token] = true;
            $assignments[] = [
                'assignmentToken' => (string)$token,
                'assignmentId' => $assignment['assignmentId'] ?? '',
                'title' => $assignment['title'] ?? '',
                'createdAt' => $assignment['createdAt'] ?? ''
            ];
        }

        $groups = [];
        $attempts = [];
        foreach ($db['attempts'] as $attempt) {
            $token = (string)($attempt['assignmentToken'] ?? '');
            if (!$token || !isset($validTokens[$token])) continue;
            $safeAttempt = [
                'assignmentToken' => $token,
                'assignmentId' => $attempt['assignmentId'] ?? '',
                'studentName' => $attempt['studentName'] ?? '',
                'className' => $attempt['className'] ?? '',
                'answer' => $attempt['answer'] ?? '',
                'correct' => !empty($attempt['correct']),
                'createdAt' => $attempt['createdAt'] ?? ''
            ];
            $attempts[] = $safeAttempt;
            $groupKey = strtolower((string)$safeAttempt['studentName']) . '|' . strtolower((string)$safeAttempt['className']) . '|' . $token;
            if (!isset($groups[$groupKey])) {
                $groups[$groupKey] = [
                    'assignmentToken' => $token,
                    'assignmentId' => $safeAttempt['assignmentId'],
                    'studentName' => $safeAttempt['studentName'],
                    'className' => $safeAttempt['className'],
                    'attempts' => 0,
                    'correctCount' => 0,
                    'lastAnswer' => '',
                    'lastCorrect' => false,
                    'lastAt' => ''
                ];
            }
            $groups[$groupKey]['attempts']++;
            if ($safeAttempt['correct']) $groups[$groupKey]['correctCount']++;
            $groups[$groupKey]['lastAnswer'] = $safeAttempt['answer'];
            $groups[$groupKey]['lastCorrect'] = $safeAttempt['correct'];
            $groups[$groupKey]['lastAt'] = $safeAttempt['createdAt'];
        }

        $students = array_values($groups);
        usort($students, function ($a, $b) {
            return strcmp((string)($b['lastAt'] ?? ''), (string)($a['lastAt'] ?? ''));
        });
        usort($attempts, function ($a, $b) {
            return strcmp((string)($b['createdAt'] ?? ''), (string)($a['createdAt'] ?? ''));
        });

        $result = [
            'ok' => true,
            'assignments' => $assignments,
            'students' => $students,
            'attempts' => array_slice($attempts, 0, 500)
        ];
    }
} else {
    $result = ['ok' => false, 'error' => 'unknown_action'];
    $status = 400;
}

if ($dirty) {
    rewind($fh);
    ftruncate($fh, 0);
    $encoded = json_encode($db, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($encoded === false || fwrite($fh, $encoded) === false) {
        flock($fh, LOCK_UN);
        fclose($fh);
        respond(['ok' => false, 'error' => 'storage_write_failed'], 500);
    }
    fflush($fh);
    @chmod($dataPath, 0600);
}

flock($fh, LOCK_UN);
fclose($fh);
respond($result ?? ['ok' => false, 'error' => 'unknown'], $status);
