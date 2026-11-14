<?php
/**
 * Shrimp Pub — Morecambe F.C. ("The Shrimps") Live Match Proxy & 1-Hour Cache
 *
 * Deployed to SpaceWeb alongside index.html (`dist/get_matches.php`).
 * - Maintains local file cache (`morecambe_cache.json`) with TTL = 3600s (max 24 API requests/day).
 * - Primary upstream: FotMob Team API (id=8489, National League North + FA Cup Qualification).
 * - Secondary upstream: TheSportsDB free API (idTeam=134369).
 * - Falls back to stale cache or built-in verified match array so the widget never breaks.
 */

@ini_set('display_errors', '0');
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Cache-Control: public, max-age=300');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

define('MORECAMBE_CACHE_FILE', __DIR__ . '/morecambe_cache.json');
define('MORECAMBE_CACHE_TTL', 3600);
define('MORECAMBE_FOTMOB_ID', 8489);
define('MORECAMBE_SPORTSDB_ID', 134369);
define('MORECAMBE_STADIUM', 'Halo Aerospace Stadium');

/**
 * Built-in verified recent matches fallback (last verified 2026-11-11).
 */
function getVerifiedFallbackPayload() {
    return array(
        'ok' => true,
        'team' => array(
            'id' => MORECAMBE_FOTMOB_ID,
            'name' => 'Morecambe F.C.',
            'nickname' => 'The Shrimps',
            'badge' => 'https://images.fotmob.com/image_resources/logo/teamlogo/8489.png',
            'league' => 'National League North',
            'stadium' => MORECAMBE_STADIUM,
        ),
        'matches' => array(
            array(
                'id' => '5907103',
                'date' => '2026-11-10T19:45:00.000Z',
                'dateIso' => '2026-11-10',
                'homeTeam' => 'Morecambe',
                'awayTeam' => 'Hereford',
                'homeScore' => 2,
                'awayScore' => 2,
                'homeBadge' => 'https://images.fotmob.com/image_resources/logo/teamlogo/8489.png',
                'awayBadge' => 'https://images.fotmob.com/image_resources/logo/teamlogo/799249.png',
                'isMorecambeHome' => true,
                'result' => 'D',
                'resultRu' => 'Ничья',
                'competition' => 'National League North',
                'venue' => MORECAMBE_STADIUM,
                'status' => 'FT',
                'isLive' => false,
            ),
            array(
                'id' => '5907151',
                'date' => '2026-11-07T15:00:00.000Z',
                'dateIso' => '2026-11-07',
                'homeTeam' => 'Hednesford Town',
                'awayTeam' => 'Morecambe',
                'homeScore' => 6,
                'awayScore' => 2,
                'homeBadge' => 'https://images.fotmob.com/image_resources/logo/teamlogo/9923.png',
                'awayBadge' => 'https://images.fotmob.com/image_resources/logo/teamlogo/8489.png',
                'isMorecambeHome' => false,
                'result' => 'L',
                'resultRu' => 'Поражение',
                'competition' => 'National League North',
                'venue' => 'Выездной матч',
                'status' => 'FT',
                'isLive' => false,
            ),
            array(
                'id' => '5907139',
                'date' => '2026-10-31T15:00:00.000Z',
                'dateIso' => '2026-10-31',
                'homeTeam' => 'Morecambe',
                'awayTeam' => 'Scarborough Athletic',
                'homeScore' => 2,
                'awayScore' => 0,
                'homeBadge' => 'https://images.fotmob.com/image_resources/logo/teamlogo/8489.png',
                'awayBadge' => 'https://images.fotmob.com/image_resources/logo/teamlogo/580382.png',
                'isMorecambeHome' => true,
                'result' => 'W',
                'resultRu' => 'Победа',
                'competition' => 'National League North',
                'venue' => MORECAMBE_STADIUM,
                'status' => 'FT',
                'isLive' => false,
            ),
        ),
        'nextMatch' => array(
            'id' => '5907163',
            'date' => '2026-11-21T15:00:00.000Z',
            'dateIso' => '2026-11-21',
            'homeTeam' => 'Morecambe',
            'awayTeam' => "King's Lynn Town",
            'homeBadge' => 'https://images.fotmob.com/image_resources/logo/teamlogo/8489.png',
            'awayBadge' => 'https://images.fotmob.com/image_resources/logo/teamlogo/45731.png',
            'isMorecambeHome' => true,
            'competition' => 'National League North',
        ),
        'source' => 'fallback',
        'cached' => false,
        'stale' => true,
        'updatedAt' => gmdate('c'),
    );
}

/**
 * Perform HTTP GET with a short 4s timeout using cURL (preferred) or file_get_contents.
 */
function httpGetJson($url, $timeoutSeconds = 4) {
    $raw = false;

    if (function_exists('curl_init')) {
        $ch = @curl_init($url);
        if ($ch !== false) {
            @curl_setopt_array($ch, array(
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_TIMEOUT => $timeoutSeconds,
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_HTTPHEADER => array(
                    'User-Agent: Mozilla/5.0 (compatible; ShrimpPubTracker/1.0)',
                    'Accept: application/json',
                    'Accept-Language: en-GB,en;q=0.9',
                ),
            ));
            $resp = @curl_exec($ch);
            $code = @curl_getinfo($ch, CURLINFO_HTTP_CODE);
            @curl_close($ch);
            if ($resp !== false && $code >= 200 && $code < 300) {
                $raw = $resp;
            }
        }
    } elseif (ini_get('allow_url_fopen')) {
        $ctx = stream_context_create(array(
            'http' => array(
                'method' => 'GET',
                'timeout' => $timeoutSeconds,
                'ignore_errors' => false,
                'header' => "User-Agent: Mozilla/5.0 (compatible; ShrimpPubTracker/1.0)\r\nAccept: application/json\r\n",
            ),
            'ssl' => array(
                'verify_peer' => true,
                'verify_peer_name' => true,
            ),
        ));
        $resp = @file_get_contents($url, false, $ctx);
        if ($resp !== false) {
            $raw = $resp;
        }
    }

    if (!is_string($raw) || $raw === '') {
        return null;
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : null;
}

/**
 * Compute W/D/L and Russian label relative to Morecambe F.C.
 */
function computeOutcome($homeScore, $awayScore, $isMorecambeHome, $isLive) {
    if ($isLive) {
        return array('LIVE', 'Идёт матч');
    }
    $ourScore = $isMorecambeHome ? $homeScore : $awayScore;
    $oppScore = $isMorecambeHome ? $awayScore : $homeScore;
    if ($ourScore > $oppScore) {
        return array('W', 'Победа');
    }
    if ($ourScore < $oppScore) {
        return array('L', 'Поражение');
    }
    return array('D', 'Ничья');
}

/**
 * Parse FotMob Team API payload into normalized structure.
 */
function fetchFromFotMob() {
    $url = 'https://www.fotmob.com/api/data/teams?id=' . MORECAMBE_FOTMOB_ID;
    $data = httpGetJson($url, 4);
    if (!$data || !isset($data['fixtures']['allFixtures']['fixtures']) || !is_array($data['fixtures']['allFixtures']['fixtures'])) {
        return null;
    }

    $stadium = MORECAMBE_STADIUM;
    if (!empty($data['overview']['venue']['widget']['name'])) {
        $stadium = (string)$data['overview']['venue']['widget']['name'];
    }

    $leagueName = 'National League North';
    if (!empty($data['details']['primaryLeagueName'])) {
        $leagueName = (string)$data['details']['primaryLeagueName'];
    }

    $allFixtures = $data['fixtures']['allFixtures']['fixtures'];
    $played = array();
    $upcoming = array();

    foreach ($allFixtures as $item) {
        if (!is_array($item) || empty($item['status']['utcTime'])) {
            continue;
        }
        $status = $item['status'];
        if (!empty($status['cancelled'])) {
            continue;
        }

        $started = !empty($status['started']);
        $finished = !empty($status['finished']);

        if ($finished || $started) {
            $played[] = $item;
        } else {
            $upcoming[] = $item;
        }
    }

    if (count($played) === 0) {
        return null;
    }

    // Sort played matches newest first
    usort($played, function ($a, $b) {
        $ta = strtotime($a['status']['utcTime']);
        $tb = strtotime($b['status']['utcTime']);
        return ($tb ?: 0) <=> ($ta ?: 0);
    });

    $recentThree = array_slice($played, 0, 3);
    $matches = array();

    foreach ($recentThree as $m) {
        $home = isset($m['home']) ? $m['home'] : array();
        $away = isset($m['away']) ? $m['away'] : array();
        $homeId = isset($home['id']) ? (int)$home['id'] : 0;
        $awayId = isset($away['id']) ? (int)$away['id'] : 0;
        $homeName = isset($home['name']) ? (string)$home['name'] : 'Home';
        $awayName = isset($away['name']) ? (string)$away['name'] : 'Away';
        $homeScore = isset($home['score']) ? (int)$home['score'] : 0;
        $awayScore = isset($away['score']) ? (int)$away['score'] : 0;

        $isMorecambeHome = ($homeId === MORECAMBE_FOTMOB_ID || stripos($homeName, 'Morecambe') !== false);
        $isLive = (!empty($m['status']['started']) && empty($m['status']['finished']));
        list($result, $resultRu) = computeOutcome($homeScore, $awayScore, $isMorecambeHome, $isLive);

        $utcTime = (string)$m['status']['utcTime'];
        $statusShort = 'FT';
        if ($isLive) {
            $statusShort = !empty($m['status']['liveTime']['short'])
                ? (string)$m['status']['liveTime']['short']
                : (!empty($m['status']['reason']['short']) ? (string)$m['status']['reason']['short'] : 'LIVE');
        } elseif (!empty($m['status']['reason']['short'])) {
            $statusShort = (string)$m['status']['reason']['short'];
        }

        $compName = !empty($m['tournament']['name']) ? (string)$m['tournament']['name'] : $leagueName;

        $matches[] = array(
            'id' => isset($m['id']) ? (string)$m['id'] : substr($utcTime, 0, 10),
            'date' => $utcTime,
            'dateIso' => substr($utcTime, 0, 10),
            'homeTeam' => $homeName,
            'awayTeam' => $awayName,
            'homeScore' => $homeScore,
            'awayScore' => $awayScore,
            'homeBadge' => $homeId > 0 ? ('https://images.fotmob.com/image_resources/logo/teamlogo/' . $homeId . '.png') : '',
            'awayBadge' => $awayId > 0 ? ('https://images.fotmob.com/image_resources/logo/teamlogo/' . $awayId . '.png') : '',
            'isMorecambeHome' => $isMorecambeHome,
            'result' => $result,
            'resultRu' => $resultRu,
            'competition' => $compName,
            'venue' => $isMorecambeHome ? $stadium : 'Выездной матч',
            'status' => $statusShort,
            'isLive' => $isLive,
        );
    }

    $nextMatch = null;
    if (count($upcoming) > 0) {
        usort($upcoming, function ($a, $b) {
            $ta = strtotime($a['status']['utcTime']);
            $tb = strtotime($b['status']['utcTime']);
            return ($ta ?: 0) <=> ($tb ?: 0);
        });
        $nx = $upcoming[0];
        $nxHome = isset($nx['home']) ? $nx['home'] : array();
        $nxAway = isset($nx['away']) ? $nx['away'] : array();
        $nxHomeId = isset($nxHome['id']) ? (int)$nxHome['id'] : 0;
        $nxAwayId = isset($nxAway['id']) ? (int)$nxAway['id'] : 0;
        $nxUtc = (string)$nx['status']['utcTime'];
        $nextMatch = array(
            'id' => isset($nx['id']) ? (string)$nx['id'] : substr($nxUtc, 0, 10),
            'date' => $nxUtc,
            'dateIso' => substr($nxUtc, 0, 10),
            'homeTeam' => isset($nxHome['name']) ? (string)$nxHome['name'] : 'Morecambe',
            'awayTeam' => isset($nxAway['name']) ? (string)$nxAway['name'] : 'TBD',
            'homeBadge' => $nxHomeId > 0 ? ('https://images.fotmob.com/image_resources/logo/teamlogo/' . $nxHomeId . '.png') : '',
            'awayBadge' => $nxAwayId > 0 ? ('https://images.fotmob.com/image_resources/logo/teamlogo/' . $nxAwayId . '.png') : '',
            'isMorecambeHome' => ($nxHomeId === MORECAMBE_FOTMOB_ID),
            'competition' => !empty($nx['tournament']['name']) ? (string)$nx['tournament']['name'] : $leagueName,
        );
    }

    return array(
        'ok' => true,
        'team' => array(
            'id' => MORECAMBE_FOTMOB_ID,
            'name' => 'Morecambe F.C.',
            'nickname' => 'The Shrimps',
            'badge' => 'https://images.fotmob.com/image_resources/logo/teamlogo/' . MORECAMBE_FOTMOB_ID . '.png',
            'league' => $leagueName,
            'stadium' => $stadium,
        ),
        'matches' => $matches,
        'nextMatch' => $nextMatch,
        'source' => 'fotmob',
        'cached' => false,
        'stale' => false,
        'updatedAt' => gmdate('c'),
    );
}

/**
 * Secondary upstream: TheSportsDB free API (merges latest event with verified history).
 */
function fetchFromSportsDbMerged($baseMatches) {
    $url = 'https://www.thesportsdb.com/api/v1/json/123/eventslast.php?id=' . MORECAMBE_SPORTSDB_ID;
    $data = httpGetJson($url, 3);
    if (!$data || empty($data['results']) || !is_array($data['results'])) {
        return null;
    }

    $byDate = array();
    foreach ($data['results'] as $ev) {
        if (!is_array($ev) || $ev['intHomeScore'] === null || $ev['intAwayScore'] === null) {
            continue;
        }
        $dateIso = !empty($ev['dateEvent']) ? (string)$ev['dateEvent'] : '';
        if ($dateIso === '') {
            continue;
        }
        $timePart = !empty($ev['strTime']) ? (string)$ev['strTime'] : '15:00:00';
        $tsRaw = !empty($ev['strTimestamp']) ? (string)$ev['strTimestamp'] : ($dateIso . 'T' . $timePart);
        $utcIso = (substr($tsRaw, -1) === 'Z') ? $tsRaw : ($tsRaw . 'Z');
        $homeTeam = isset($ev['strHomeTeam']) ? (string)$ev['strHomeTeam'] : 'Home';
        $awayTeam = isset($ev['strAwayTeam']) ? (string)$ev['strAwayTeam'] : 'Away';
        $homeScore = (int)$ev['intHomeScore'];
        $awayScore = (int)$ev['intAwayScore'];
        $isMorecambeHome = ((string)($ev['idHomeTeam'] ?? '') === (string)MORECAMBE_SPORTSDB_ID || stripos($homeTeam, 'Morecambe') !== false);
        list($result, $resultRu) = computeOutcome($homeScore, $awayScore, $isMorecambeHome, false);

        $comp = !empty($ev['strLeague']) ? str_replace('English ', '', (string)$ev['strLeague']) : 'National League North';

        $byDate[$dateIso] = array(
            'id' => isset($ev['idEvent']) ? (string)$ev['idEvent'] : $dateIso,
            'date' => $utcIso,
            'dateIso' => $dateIso,
            'homeTeam' => $homeTeam,
            'awayTeam' => $awayTeam,
            'homeScore' => $homeScore,
            'awayScore' => $awayScore,
            'homeBadge' => !empty($ev['strHomeTeamBadge']) ? (string)$ev['strHomeTeamBadge'] : '',
            'awayBadge' => !empty($ev['strAwayTeamBadge']) ? (string)$ev['strAwayTeamBadge'] : '',
            'isMorecambeHome' => $isMorecambeHome,
            'result' => $result,
            'resultRu' => $resultRu,
            'competition' => $comp,
            'venue' => !empty($ev['strVenue']) ? (string)$ev['strVenue'] : ($isMorecambeHome ? MORECAMBE_STADIUM : 'Выездной матч'),
            'status' => !empty($ev['strStatus']) ? (string)$ev['strStatus'] : 'FT',
            'isLive' => false,
        );
    }

    if (count($byDate) === 0) {
        return null;
    }

    foreach ($baseMatches as $bm) {
        if (!isset($byDate[$bm['dateIso']])) {
            $byDate[$bm['dateIso']] = $bm;
        }
    }

    $merged = array_values($byDate);
    usort($merged, function ($a, $b) {
        return strcmp($b['dateIso'], $a['dateIso']);
    });

    $fallback = getVerifiedFallbackPayload();
    $fallback['matches'] = array_slice($merged, 0, 3);
    $fallback['source'] = 'thesportsdb';
    $fallback['stale'] = false;
    $fallback['updatedAt'] = gmdate('c');
    return $fallback;
}

/**
 * Read cached JSON if present and valid.
 */
function readCacheFile() {
    if (!is_file(MORECAMBE_CACHE_FILE) || !is_readable(MORECAMBE_CACHE_FILE)) {
        return null;
    }
    $mtime = @filemtime(MORECAMBE_CACHE_FILE);
    $raw = @file_get_contents(MORECAMBE_CACHE_FILE);
    if (!is_string($raw) || $raw === '') {
        return null;
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded) || empty($decoded['matches']) || !is_array($decoded['matches'])) {
        return null;
    }
    return array(
        'age' => $mtime !== false ? max(0, time() - $mtime) : (MORECAMBE_CACHE_TTL + 1),
        'data' => $decoded,
    );
}

// 1. Check fresh 1-hour file cache
$cachedEntry = readCacheFile();
if ($cachedEntry !== null && $cachedEntry['age'] < MORECAMBE_CACHE_TTL) {
    $payload = $cachedEntry['data'];
    $payload['cached'] = true;
    $payload['stale'] = false;
    header('X-Cache: HIT');
    header('X-Cache-Age: ' . $cachedEntry['age']);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// 2. Cache MISS -> fetch fresh upstream data
$freshPayload = fetchFromFotMob();
if ($freshPayload === null) {
    $baseMatches = $cachedEntry !== null ? $cachedEntry['data']['matches'] : getVerifiedFallbackPayload()['matches'];
    $freshPayload = fetchFromSportsDbMerged($baseMatches);
}

if ($freshPayload !== null) {
    $jsonOut = json_encode($freshPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (is_string($jsonOut)) {
        @file_put_contents(MORECAMBE_CACHE_FILE, $jsonOut, LOCK_EX);
    }
    header('X-Cache: MISS');
    echo $jsonOut;
    exit;
}

// 3. Upstream failed -> fallback to stale cache if available
if ($cachedEntry !== null) {
    $stalePayload = $cachedEntry['data'];
    $stalePayload['cached'] = true;
    $stalePayload['stale'] = true;
    header('X-Cache: STALE');
    echo json_encode($stalePayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// 4. Final fallback -> built-in verified real match array
header('X-Cache: FALLBACK');
echo json_encode(getVerifiedFallbackPayload(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
