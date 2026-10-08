<?php
$host = '127.0.0.1';
$db = getenv('DB_DATABASE') ?: 'cibenda_mart';
$user = getenv('DB_USERNAME') ?: 'sho';
$pass = getenv('DB_PASSWORD') ?: '';

list($_, $script, $mode, $userId, $gate, $table, $token) = $argv;

$pdo = new PDO("mysql:host={$host};dbname={$db}", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);
$pdo->exec('SET SESSION innodb_lock_wait_timeout = 3');

// barrier ketat: busy-wait sampai waktu target tercapai.
// maxwait mencegah hang kalau gate tidak pernah diisi.
$batasTunggu = microtime(true) + 30;
while (true) {
    $target = @file_get_contents($gate);
    if ($target !== false && $target !== '') {
        if ((int) (microtime(true) * 1000000) >= (int) $target) {
            break;
        }
    }
    if (microtime(true) > $batasTunggu) {
        echo "ERR:barrier-timeout\n";
        exit(0);
    }
    usleep(50);
}

try {
    // logika handoff versi produksi: cek + tulis dalam satu transaksi + row lock
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("SELECT id, last_seen_at FROM {$table} WHERE fcm_token = ? AND id != ? FOR UPDATE");
    $stmt->execute([$token, (int) $userId]);
    $pemilik = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($pemilik) {
        $aktif = $pemilik['last_seen_at'] && strtotime($pemilik['last_seen_at']) > time() - 900;
        if ($aktif) {
            $pdo->rollBack();
            echo "TOLAK\n";
            exit(0);
        }
        $pdo->prepare("UPDATE {$table} SET fcm_token = NULL WHERE id = ?")->execute([$pemilik['id']]);
    }

    $pdo->prepare("UPDATE {$table} SET fcm_token = ?, last_seen_at = NOW() WHERE id = ?")->execute([$token, (int) $userId]);
    $pdo->commit();
    echo "OK\n";
} catch (Throwable $e) {
    echo "ERR:".get_class($e)."\n";
}