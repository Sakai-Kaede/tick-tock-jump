<?php
$servername = "";
$username = "";
$password = "";
$dbname = "";

// データベースに接続
$conn = new mysqli($servername, $username, $password, $dbname);

// 接続確認
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// フォームからのデータを取得
$userName = $_POST['userName'];
$gameScore = $_POST['gameScore'];

// ユーザー名が12文字以上の場合は12文字に整形
$userName = substr($userName, 0, 12);
// トリミングとエスケープ
$userName = $conn->real_escape_string($userName);

// ゲームスコアのバリデーション
if (!filter_var($gameScore, FILTER_VALIDATE_INT, array("options" => array("min_range" => 0, "max_range" => 99999)))) {
    echo "無効な入力が検出されました。";
    $conn->close();
    exit;
}

// パラメータ化クエリを使用してデータベースにデータを挿入
$sql = $conn->prepare("INSERT INTO scores (name, score) VALUES (?, ?)");

// パラメータをバインド
$sql->bind_param("si", $userName, $gameScore);

// クエリを実行
if ($sql->execute()) {
    echo "データが正常に挿入されました";
} else {
    echo "エラーが発生しました。";
}

// データベース接続を閉じる
$conn->close();
?>