// fetchRanking.js
document.addEventListener('DOMContentLoaded', function () {
    // データベースからランキングを取得するためのAjaxリクエスト
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'getRanking.php', true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                // データが正常に取得された場合の処理
                try {
                    var rankingData = JSON.parse(xhr.responseText);
                    displayRanking(rankingData);
                } catch (e) {
                    console.error("JSON パースエラー: " + e.message);
                }
            } else {
                // Handle error (display an error message, log to console, etc.)
                console.error("Error fetching ranking: " + xhr.status);
            }
        }
    };

    // リクエストを送信
    xhr.send();
});

function displayRanking(rankingData) {
    let table = document.getElementById('rankingTable');

    // 既存のデータをクリア
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // ランキングデータをテーブルに表示
    for (let i = 0; i < rankingData.length; i++) {
        let row = table.insertRow(-1);
        let rankCell = row.insertCell(0);
        let userCell = row.insertCell(1);
        let scoreCell = row.insertCell(2);

        rankCell.textContent = i + 1;
        userCell.textContent = rankingData[i].name;
        scoreCell.textContent = rankingData[i].score;
    }
}