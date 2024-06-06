<?php
    $servername = "";
    $username = "";
    $password = "";
    $dbname = "";

    // データベースに接続
    $conn = new mysqli($servername, $username, $password, $dbname);

    // 接続確認
    if ($conn->connect_error) {
        die("Connection failed");
    }

    // ランキングデータを取得
    $sql = "SELECT * FROM scores ORDER BY score DESC LIMIT 100";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // データがある場合はJSON形式で出力
        $rankingData = array();
        while ($row = $result->fetch_assoc()) {
            $rankingData[] = $row;
        }
        echo json_encode($rankingData, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);
    } else {
        echo "ランキングデータがありません";
    }

    // データベース接続を閉じる
    $conn->close();
?>
