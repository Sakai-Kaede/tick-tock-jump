(() => {
    /**
     * キーの押下状態を調べるためのオブジェクト
     * このオブジェクトはプロジェクトのどこからでも参照できるように
     * window オブジェクトのカスタムプロパティとして設定する
     * @global
     * @type {object}
     */
    window.isKeyDown = {};
    /**
     * スコアを格納する
     * このオブジェクトはプロジェクトのどこからでも参照できるように
     * window オブジェクトのカスタムプロパティとして設定する
     * @global
     * @type {number}
     */
    window.gameScore = 0;

    /**
     * canvas の幅
     * @type {number}
     */
    const CANVAS_WIDTH = 750;
    /**
     * canvas の高さ
     * @type {number}
     */
    const CANVAS_HEIGHT = 750;
    /**
     * 1分間の角度（時計の60分割）
     * @type {number}
     */
    const sixtieth = 2 * Math.PI / 60;
    /**
     * 1時間の角度（時計の12分割）
     * @type {number}
     */
    const twelfth = sixtieth * 5;
    /**
     * 背景を流れる星の個数
     * @type {number}
     */
    const BACKGROUND_STAR_MAX_COUNT = 150;
    /**
     * 背景を流れる星の最大サイズ
     * @type {number}
     */
    const BACKGROUND_STAR_MAX_SIZE = 3;
    /**
     * 描画対象となる Canvas Element
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById("clock");
    /**
     * Canvas2D API のコンテキスト
     * @type {CanvasRenderingContext2D}
     */
    const c = canvas.getContext("2d");

    // キーボードのキーを追跡するオブジェクト
    const Keys = {
        up: {
            // 上向きキーが押されたかどうかのフラグ
            pressed: false
        }
    };

    /**
     * ランダム時間（時、分、秒）
     * @type {string}
     */
    let randomHour = "  ";
    let randomMinute = "  ";
    let randomSecond = "  ";
    /**
     * グレー表示のランダム時間（時、分、秒）
     * @type {string}
     */
    let randomHourGray = "--";
    let randomMinuteGray = "--";
    let randomSecondGray = "--";
    /**
     * ゲーム中の時計の時間（時、分、秒）
     * @type {string}
     */
    let nowHour = 99;
    let nowMinute = 99;
    let nowSecond = 99;
    /**
     * 時計の針の角度
     * @type {number}
     */
    let secondsAngle = 0;
    let minutesAngle = 0;
    let hoursAngle = 0;
    /**
     * 時計の針の角度
     * @type {number}
     */
    let numbersRotationAngle = 0;
    /**
     * ゲームの経過時間と最後の更新時刻
     * @type {number}
     */
    let timeElapsed = 0;
    let last = 0;
    /**
     * ゲームの開始時刻と終了時刻
     * @type {number}
     */
    let startTime = 0;
    let endTime = 0;
    /**
     * 逆回転を管理する時間
     * @type {number}
     */
    let reverseTime = 0;
    /**
     * 時計の半径
     * @type {number}
     */
    let clockRadius = 0;
    /**
     * シーンマネージャー
     * @type {SceneManager}
     */
    let scene = null;
    /**
     * 自機キャラクターのインスタンス
     * @type {Player}
     */
    let player = null;
    /**
     * 足場のインスタンス
     * @type {Player}
     */
    let platform = null;
    /**
     * ゲームオーバーエフェクトのインスタンス
     * @type {Player}
     */
    let explosion = null;
    /**
     * 大ジャンプエフェクトのインスタンス
     * @type {Player}
     */
    let starExplosion = null;
    /**
     * ゲームのリスタートフラグ
     * @type {boolean}
     */
    let restart = false;
    /**
     * 逆回転の開始フラグ
     * @type {boolean}
     */
    let reverseStart = false;
    /**
     * ゲームオーバー条件の開始フラグ
     * @type {boolean}
     */
    let gameOver = false;
    /**
     * レベル4の開始フラグ
     * @type {boolean}
     */
    let level4 = false;
    /**
     * レベル4のゲームオーバー条件の開始フラグ
     * @type {boolean}
     */
    let level4_gameOver = false;
    /**
     * 逆回転の方向を決定するフラグ
     * @type {boolean}
     */
    let reverse = false;
    /**
     * ゲームの開始フラグ
     * @type {boolean}
     */
    let startGame = false;
    /**
     * フォームの表示フラグ
     * @type {boolean}
     */
    let isForm = false;
    /**
     * 大ジャンプのエフェクトを出すか判定
     * @type {boolean}
     */
    let isStar = true;
    /**
     * 説明文のテキスト
     * @type {string}
     */
    let explanatoryText;
    /**
     * 文字盤の回転速度
     * @type {number}
     */
    let rotationSpeed = 0;
    /**
     * 流れる星のインスタンスを格納する配列
     * @type {Array<BackgroundStar>}
     */
    let backgroundStarArray = [];

    /**
     * ページのロードが完了したときに発火する load イベント
     */
    window.addEventListener('load', () => {
        initialize();
        initHandsAngles();

        let jumpStartTime; // ジャンプ開始時のタイムスタンプ

        window.addEventListener('keydown', ({ key }) => {
            switch (key) {
                case " ":
                    if (!jumpStartTime) {
                        jumpStartTime = Date.now(); // ジャンプ開始時のタイムスタンプを記録
                        
                    }
                    const jumpDuration = Date.now() - jumpStartTime; // ジャンプの長さを計算
                    if(jumpDuration > 300 && isStar){
                        starExplosion.set(player.position.x + (player.width / 2), player.position.y + (player.height / 2));
                        isStar = false;
                    }
                    break;
            }
        });
        window.addEventListener('keyup', ({ key }) => {
            switch (key) {
                case " ":
                    if (jumpStartTime) {
                        const jumpDuration = Date.now() - jumpStartTime; // ジャンプの長さを計算
                        const isBigJump = jumpDuration > 300;

                        handleJump(isBigJump && !isStar); // ジャンプを処理
                        jumpStartTime = null; // タイムスタンプをリセット
                        isStar = true; 
                    }
                    break;
            }
        });

        let starTimer; // スターのタイマー

        window.addEventListener('touchstart', () => {
            if (!jumpStartTime) {
                jumpStartTime = Date.now(); // ジャンプ開始時のタイムスタンプを記録

                // タッチ開始から300ミリ秒後にスターの爆発を設定
                starTimer = setTimeout(() => {
                    const jumpDuration = Date.now() - jumpStartTime; // ジャンプの長さを計算
                    if(jumpDuration >= 300 && isStar){
                        starExplosion.set(player.position.x + (player.width / 2), player.position.y + (player.height / 2));
                        isStar = false;
                    }
                }, 300);
            }
        });
        window.addEventListener('touchend', () => {
            if (jumpStartTime) {
                const jumpDuration = Date.now() - jumpStartTime; // ジャンプの長さを計算
                const isBigJump = jumpDuration > 300; // 300ミリ秒以上で大ジャンプ

                // タッチが300ミリ秒未満で終了した場合、タイマーをキャンセル
                if(jumpDuration < 300){
                    clearTimeout(starTimer);
                }

                handleJump(isBigJump); // ジャンプを処理
                jumpStartTime = null; // タイムスタンプをリセット
                isStar = true; 
            }
        });

        eventSetting();
        sceneSetting();
        
        render();
    }, false);
    
    /**
     * canvas やコンテキストを初期化する
     */
    function initialize() {
        let shortestSide;

        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        scene = new SceneManager();

        platform = new Platform(c, 355,200,40,10);

        explosion = new Explosion(c, 50.0, 20, 70.0, 1.5);
        starExplosion = new StarExplosion(c, 100.0, 3, 70.0, 3);

        shortestSide = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT);
        clockRadius = shortestSide / 2 - shortestSide / 20;

        // 流れる星を初期化する
        for(i = 0; i < BACKGROUND_STAR_MAX_COUNT; ++i){
            // 星の速度と大きさはランダムと最大値によって決まるようにする
            let size  = 1 + Math.random() * (BACKGROUND_STAR_MAX_SIZE - 1);
            // 星のインスタンスを生成する
            backgroundStarArray[i] = new BackgroundStar(c, size);
            // 星の初期位置もランダムに決まるようにする
            let x = Math.random() * CANVAS_WIDTH;
            let y = Math.random() * CANVAS_HEIGHT;
            backgroundStarArray[i].set(x, y);
        }
    }

    /**
     * イベントを設定する
     */
    function eventSetting(){
        // キーの押下時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keydown', (event) => {
            // キーの押下状態を管理するオブジェクトに押下されたことを設定する
            isKeyDown[`key_${event.key}`] = true;
            // ゲームオーバーから再スタートするための設定（エンターキー）
            if(event.key === ' '){
                // 自機キャラクターのライフが 0 以下の状態
                if(gameOver){
                    // 再スタートフラグを立てる
                    restart = true;
                }
            }
        }, false);
        // キーが離された時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keyup', (event) => {
            // キーが離されたことを設定する
            isKeyDown[`key_${event.key}`] = false;
        }, false);
        // スマートフォンのタップ操作をリッスン
        window.addEventListener('touchstart', () => {
            // エンターキーと同じ処理を行う
            if (gameOver) {
                restart = true;
            }
        });
        // キーの押下時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keydown', (event) => {
            // キーの押下状態を管理するオブジェクトに押下されたことを設定する
            isKeyDown[`key_${event.key}`] = true;
            // ゲームオーバーから再スタートするための設定（エンターキー）
            if(event.key === ' '){
                // 再スタートフラグを立てる
                startGame = true;
            }
        }, false);
        // キーが離された時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keyup', (event) => {
            // キーが離されたことを設定する
            isKeyDown[`key_${event.key}`] = false;
        }, false);
        // スマートフォンのタップ操作をリッスン
        window.addEventListener('touchstart', () => {
            startGame = true;
        });
    }

    /**
     * シーンを設定する
     */
    function sceneSetting(){
        // イントロシーン
        scene.add('intro', (time) => {
            explanatoryText = "Space or Tap to Start";
            player = new Player(c, 999, 999, 0, 0, CANVAS_HEIGHT);
            if(startGame) {
                scene.use('start');
            }
            
        });
        scene.add('start', (time) => {
            reverseTime = 0;
            gameOver = false;
            isForm = false;
            reverseStart = false;
            level4 = false;
            level4_gameOver = false;
            isStar = true;
            startTime = new Date().getTime();
            player = new Player(c, 357.5, 75, 35, 35, CANVAS_HEIGHT);
            
            // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
            randomHour = "  ";
            randomMinute = "  ";
            randomSecond = "  ";
            randomHourGray = "--";
            randomMinuteGray = "--";
            randomSecondGray = "--";
            randomIndex = 99;
            scene.use('main-level-1');
        });
        scene.add('main-level-1', (time) => {
            explanatoryText = "Space or Tap to Jump";
            if(gameOver){
                scene.use('game_over');
            }
            if(time > 28){
                scene.use('main-level-2');
            }
        });
        scene.add('main-level-2', (time) => {
            reverseStart = true;
            if(gameOver){
                scene.use('game_over');
            }
            if(time > 32){
                scene.use('main-level-3');
            }
        });
        scene.add('main-level-3', (time) => {
            rotationSpeed = 0.00003;
            if(gameOver){
                scene.use('game_over');
            }
            if(time > 30){
                scene.use('main-level4-intro');
            }
        });
        scene.add('main-level4-intro', (time) => {
            level4 = true;
            if(gameOver){
                scene.use('game_over');
            }
            if(time > 5){
                scene.use('main-level-4');
            }
        });
        scene.add('main-level-4', (time) => {
            level4_gameOver = true;
            if(gameOver){
                scene.use('game_over');
            }
        });
        // ゲームオーバーシーン
        scene.add('game_over', (time) => {
            isStar = false;
            reverseStart = false;
            rotationSpeed = 0;
            explanatoryText = "Space or Tap to Restart";
            if(restart === true && isForm === false){
                // 再スタートフラグはここでまず最初に下げておく
                restart = false;
                // スコアをリセットしておく
                gameScore = 0;
                scene.use('start');
            }
        });
        // 一番最初のシーンには intro を設定する
        scene.use('intro');
    }

    /**
     * 描画処理を行う
     */
    function render() {
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') {
                return 1;
            } else {
                game_Over();
                gameOver = true;
            }
        });

        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        c.globalAlpha = 1.0;
        // 現在の時刻をendTimeに代入
        endTime = new Date().getTime();

        // シーンを更新する
        scene.update();

        setRandomTime();

        // 背景のグラデーションを開始
        animateBackground();

        // 流れる星の状態を更新する
        backgroundStarArray.map((v) => {
            v.update();
        });

        digitalClock();

        updateHandsAngles();
        updateNumbersAngles();
        drawClock();
        // スコアの表示
        drawText(c, "Score : " + zeroPadding(gameScore, 5), 170, 70);
        if(startGame){
            drawTextGray(c, zeroPadding(randomHourGray, 2) + ":" + zeroPadding(randomMinuteGray, 2) + ":" + zeroPadding(randomSecondGray, 2), 375, 250);
            // ゲーム中のデジタル時計を表示
            drawText(c, zeroPadding(randomHour, 2) + ":" + zeroPadding(randomMinute, 2) + ":" + zeroPadding(randomSecond, 2), 375, 250);
        } else {
            // デジタル時計を表示
            drawText(c, zeroPadding(digitalHour, 2) + ":" + zeroPadding(digitalMinute, 2) + ":" + zeroPadding(digitalSecond, 2), 375, 250);
        }
        
        // ゲームの説明を表示
        drawText(c, explanatoryText, 375, 700);    
        
        timeAngle();
        toReverse();
        

        player.update();
        platform.draw();

        isOver();

        if (isPlayerLandedOnPlatform(player, platform)) {
            player.velocity.y = 0;
            player.isJumping = false;
            player.isFalling = false;
        }

        // 爆発エフェクトの状態を更新する
        explosion.update();
        // 大ジャンプエフェクトの状態を更新する
        starExplosion.update();

        // ランキングボタンを表示
        buttonDisplay();
        // 説明ボタンを表示
        howButtonDisplay();

        // ページ読み込み時に関数を実行
        displayForm();

        requestAnimationFrame(render);
    }

    /**
     * ユーザーネームの入力欄を表示
     */
    function displayForm() {
        // gameScoreが100以上ならフォームを表示
        if (gameScore >= 100 && gameOver) {
            isForm = true;
            document.getElementById("myForm").style.display = "block";
        } else {
            document.getElementById("myForm").style.display = "none";
        }
    }

    /**
     * ランキングへのボタンの設定
     * @type {number}
     */
    const buttonWidth = 220;
    const buttonHeight = 40;
    const buttonX = 570;
    const buttonY = 40;
 
    /**
     * ランキングへのボタンを描画
     */
    function drawButton() {
        c.fillStyle = "#f5f5f5";
        c.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
 
        c.fillStyle = "#808080";
        c.font = "40px Arial";
        c.fillText("Ranking", buttonX + 85, buttonY + 21);
    }

    /**
     * ボタンがクリックされたときの処理
     */
    function handleClick(event) {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;
 
        if (
            mouseX >= buttonX &&
            mouseX <= buttonX + buttonWidth &&
            mouseY >= buttonY &&
            mouseY <= buttonY + buttonHeight
        ) {
            // ボタンがクリックされたら別のページに遷移
            window.location.href = "./ranking.html";
        }
    }

    /**
     * ボタンの表示
     */
    function buttonDisplay() {
        drawButton();
        canvas.addEventListener("click", handleClick);
    }

    /**
     * ランキングへのボタンの設定
     * @type {number}
     */
    const howButtonWidth = 220;
    const howButtonHeight = 40;
    const howButtonX = 570;
    const howButtonY = 100;
 
    /**
     * ランキングへのボタンを描画
     */
    function howDrawButton() {
        c.fillStyle = "#f5f5f5";
        c.fillRect(howButtonX, howButtonY, howButtonWidth, howButtonHeight);
 
        c.fillStyle = "#808080";
        c.font = "40px Arial";
        c.fillText("How to", howButtonX + 85, howButtonY + 21);
    }

    /**
     * ボタンがクリックされたときの処理
     */
    function howHandleClick(event) {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;
 
        if (
            mouseX >= howButtonX &&
            mouseX <= howButtonX + buttonWidth &&
            mouseY >= howButtonY &&
            mouseY <= howButtonY + buttonHeight
        ) {
            // ボタンがクリックされたら別のページに遷移
            window.location.href = "./howTo.html";
        }
    }

    /**
     * ボタンの表示
     */
    function howButtonDisplay() {
        howDrawButton();
        canvas.addEventListener("click", howHandleClick);
    }

    /**
     * ジャンプの処理
     * @param {boolean} isBigJump - true なら大ジャンプ、false なら小ジャンプ
     */
    function handleJump(isBigJump) {
        Keys.up.pressed = true;
        player.jump(isBigJump);
    }

    /**
     * ゲームスコアを増加
     */
    function increaseScore() {
        if (gameScore === 99999) {
            return 1;
        }
        if (!gameOver && startGame) {
            gameScore += 1;
        }
    }

    /**
     * 逆回転後の時間を増加
     */
    function increaseTime() {
        // 逆回転が真になったときカウント開始
        if(reverseStart){
            reverseTime++;
        }
    }

    /**
     * 時間によってランダムな時間（時、分、秒）を設定
     */
    function setRandomTime() {
        if(reverseStart){
            // 0から2の間でランダムな整数を生成
            let randomIndex = Math.floor(Math.random() * 3);
            if(reverseTime === 2 && randomHourGray === "--" && randomMinuteGray === "--" && randomSecondGray === "--"){
                if (randomIndex === 0) {
                    randomHourGray = Math.floor(Math.random() * 12) + 1;
                } else if (randomIndex === 1) {
                    randomMinuteGray = Math.floor(Math.random() * 12) * 5 + 5;
                } else {
                    randomSecondGray = Math.floor(Math.random() * 12) * 5 + 5;
                }
            }
            if(reverseTime === 7){
                randomHour = randomHourGray;
                randomMinute = randomMinuteGray;
                randomSecond = randomSecondGray;
            }
        }
    }

    let digitalHour = 0;
    let digitalMinute = 0;
    let digitalSecond = 0;
    /**
     * ゲーム前のデジタル時計に時間を設定
     */
    function digitalClock() {
        let time = new Date();
        digitalHour = time.getHours();
        digitalMinute = time.getMinutes();
        digitalSecond = time.getSeconds();
    }

    /**
     * 角度から時間を設定
     */
    function timeAngle() {
        if((secondsAngle <= (0 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 0 * 2 * Math.PI / 12)){nowSecond = 60;}
        if((secondsAngle <= (1 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 1 * 2 * Math.PI / 12)){nowSecond = 5;}
        if((secondsAngle <= (2 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 2 * 2 * Math.PI / 12)){nowSecond = 10;}
        if((secondsAngle <= (3 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 3 * 2 * Math.PI / 12)){nowSecond = 15;}
        if((secondsAngle <= (4 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 4 * 2 * Math.PI / 12)){nowSecond = 20;}
        if((secondsAngle <= (5 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 5 * 2 * Math.PI / 12)){nowSecond = 25;}
        if((secondsAngle <= (6 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 6 * 2 * Math.PI / 12)){nowSecond = 30;}
        if((secondsAngle <= (7 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 7 * 2 * Math.PI / 12)){nowSecond = 35;}
        if((secondsAngle <= (8 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 8 * 2 * Math.PI / 12)){nowSecond = 40;}
        if((secondsAngle <= (9 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 9 * 2 * Math.PI / 12)){nowSecond = 45;}
        if((secondsAngle <= (10 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 10 * 2 * Math.PI / 12)){nowSecond = 50;}
        if((secondsAngle <= (11 * 2 * Math.PI / 12) + 0.02 && secondsAngle >= 11 * 2 * Math.PI / 12)){nowSecond = 55;}

        if((minutesAngle <= (0 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (0 * 2 * Math.PI / 12))){nowMinute = 60;}
        if((minutesAngle <= (1 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (1 * 2 * Math.PI / 12))){nowMinute = 5;}
        if((minutesAngle <= (2 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (2 * 2 * Math.PI / 12))){nowMinute = 10;}
        if((minutesAngle <= (3 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (3 * 2 * Math.PI / 12))){nowMinute = 15;}
        if((minutesAngle <= (4 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (4 * 2 * Math.PI / 12))){nowMinute = 20;}
        if((minutesAngle <= (5 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (5 * 2 * Math.PI / 12))){nowMinute = 25;}
        if((minutesAngle <= (6 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (6 * 2 * Math.PI / 12))){nowMinute = 30;}
        if((minutesAngle <= (7 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (7 * 2 * Math.PI / 12))){nowMinute = 35;}
        if((minutesAngle <= (8 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (8 * 2 * Math.PI / 12))){nowMinute = 40;}
        if((minutesAngle <= (9 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (9 * 2 * Math.PI / 12))){nowMinute = 45;}
        if((minutesAngle <= (10 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (10 * 2 * Math.PI / 12))){nowMinute = 50;}
        if((minutesAngle <= (11 * 2 * Math.PI / 12) + 0.01 && minutesAngle >= (11 * 2 * Math.PI / 12))){nowMinute = 55;}

        if((hoursAngle <= (0 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 0 * 2 * Math.PI / 12)){nowHour = 12;}
        if((hoursAngle <= (1 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 1 * 2 * Math.PI / 12)){nowHour = 1;}
        if((hoursAngle <= (2 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 2 * 2 * Math.PI / 12)){nowHour = 2;}
        if((hoursAngle <= (3 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 3 * 2 * Math.PI / 12)){nowHour = 3;}
        if((hoursAngle <= (4 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 4 * 2 * Math.PI / 12)){nowHour = 4;}
        if((hoursAngle <= (5 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 5 * 2 * Math.PI / 12)){nowHour = 5;}
        if((hoursAngle <= (6 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 6 * 2 * Math.PI / 12)){nowHour = 6;}
        if((hoursAngle <= (7 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 7 * 2 * Math.PI / 12)){nowHour = 7;}
        if((hoursAngle <= (8 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 8 * 2 * Math.PI / 12)){nowHour = 8;}
        if((hoursAngle <= (9 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 9 * 2 * Math.PI / 12)){nowHour = 9;}
        if((hoursAngle <= (10 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 10 * 2 * Math.PI / 12)){nowHour = 10;}
        if((hoursAngle <= (11 * 2 * Math.PI / 12) + 0.005 && hoursAngle >= 11 * 2 * Math.PI / 12)){nowHour = 11;}
    }

    /**
     * 現在の方向と逆に回転
     */
    function toReverse() {
        // ランダムな時間と現在の時間が一致したら逆回転させる
        if(nowHour === randomHour || nowMinute === randomMinute || nowSecond === randomSecond){
            reverse = !reverse;
            increasing = !increasing;
            // 各変数を"  "で初期化
            randomHour = "  ";
            randomMinute = "  ";
            randomSecond = "  ";
            // 各変数を"--"で初期化
            randomHourGray = "--";
            randomMinuteGray = "--";
            randomSecondGray = "--";
            reverseTime = 0;
        }
    }

    /**
     * 時計の針の角度を更新
     */
    function updateHandsAngles() {
        timeElapsed = +new Date() - last;
        last = +new Date();
        if(startGame){
            if (reverse) {
                secondsAngle -= sixtieth / 100 * timeElapsed;
                minutesAngle -= sixtieth / 350 * timeElapsed;
                hoursAngle -= sixtieth / 600 * timeElapsed;
            } else {
                secondsAngle += sixtieth / 100 * timeElapsed;
                minutesAngle += sixtieth / 350 * timeElapsed;
                hoursAngle += sixtieth / 600 * timeElapsed;
            }
        } else {
            secondsAngle += sixtieth / 1000 * timeElapsed;
            minutesAngle += sixtieth / 60 * (timeElapsed / 1000);
            hoursAngle += twelfth / 60 * (timeElapsed / 1000 / 60);
        }
        
        // 0から2ラジアンに調整
        secondsAngle = (secondsAngle % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);
        minutesAngle = (minutesAngle % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);
        hoursAngle = (hoursAngle % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);
    }

    /**
     * 文字盤の回転方向を変更
     */
    function updateNumbersAngles() {
        // 変数reverseによって回転方向を変える
        if (reverse) {
            numbersRotationAngle -= rotationSpeed * timeElapsed;
        } else {
            numbersRotationAngle += rotationSpeed * timeElapsed;
        }
    }

    /**
     * 時計の針の角度を増加
     */
    function initHandsAngles() {
        let time = new Date();
        last = time.getTime();

        secondsAngle = sixtieth * time.getSeconds() + sixtieth / 1000 * time.getMilliseconds();
        minutesAngle = sixtieth * time.getMinutes() + sixtieth / 60 * time.getSeconds();
        hoursAngle = twelfth * (time.getHours() > 12 ? time.getHours() - 12 : time.getHours()) + twelfth / 60 * time.getMinutes();
    
        // 0から2ラジアンに調整
        secondsAngle = secondsAngle % (2 * Math.PI);
        minutesAngle = minutesAngle % (2 * Math.PI);
        hoursAngle = hoursAngle % (2 * Math.PI);
    }

    // 初期のバックグラウンド色（黒）
    let backgroundColor = 0;
    let increasing = true;
    /**
     * バックグラウンド色を徐々に変化
     */
    function animateBackground() {
        // 見えずらいので、没

        // if (increasing) {
        //     backgroundColor += 0.1;
        //     if (backgroundColor >= 255) {
        //         backgroundColor = 255;
        //         increasing = !increasing;
        //     }
        // } else {
        //     backgroundColor -= 0.1;
        //     if (backgroundColor <= 0) {
        //         backgroundColor = 0;
        //         increasing = !increasing;
        //     }
        // }

        // 背景を描画
        c.fillStyle = `rgb(${backgroundColor}, ${backgroundColor}, ${backgroundColor})`;
        c.fillRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * アナログ時計を描画
     */
    function drawClock() {
        // 時計の数字
        const numbers = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
        
        // 針の色
        const handsColor = "#ffffff";
    
        let index;
        let currentAngle;
        let handsWidth;
    
        // 新しく追加されたコード: 時計の内側を灰色で塗りつぶす
        const innerCircleRadius = clockRadius * 0.8; // 内側の半径を設定
        c.fillStyle = "#2b2b2b"; // 灰色の色を指定
        c.beginPath();
        c.arc(c.canvas.width / 2, c.canvas.height / 2, innerCircleRadius, 0, 2 * Math.PI);
        c.fill();
    
        // 時計の数字を描画
        c.fillStyle = handsColor;
        c.font = `${clockRadius / 5}px Arial`;
        c.textAlign = "center";
        c.textBaseline = "middle";
    
        for (index = 0; index < 12; index++) {
            currentAngle = index * twelfth - Math.PI / 2 + numbersRotationAngle;
            const x = c.canvas.width / 2 + clockRadius / 1.55 * Math.cos(currentAngle);
            const y = c.canvas.height / 2 + clockRadius / 1.55 * Math.sin(currentAngle);
            
            c.save();
            c.translate(x, y);
            c.rotate((index * 30 * Math.PI / 180) + numbersRotationAngle);
            c.fillText(numbers[index], 0, 0);
            c.restore();
        }
    
        // 時計の外側の円を描画
        c.save();
        c.strokeStyle = handsColor;
        const outerCircleRadius = clockRadius * 0.8;
        c.lineWidth = clockRadius / 30;
        c.beginPath();
        c.arc(c.canvas.width / 2, c.canvas.height / 2, outerCircleRadius, 0, 2 * Math.PI);
        c.stroke();
        c.restore();
    
        handsWidth = clockRadius / 20;
    
        // 時、分、秒の針を描画
        c.fillStyle = handsColor;
        c.strokeStyle = handsColor;
        c.lineWidth = handsWidth;
    
        c.save();
        c.translate(c.canvas.width / 2, c.canvas.height / 2);
        c.rotate(numbersRotationAngle);
    
        // 秒針の描画
        c.save();
        c.beginPath();
        c.rotate(secondsAngle);
        c.fillRect(
            -handsWidth / 2,
            -handsWidth / 2,
            handsWidth,
            -clockRadius + clockRadius / 5
        );
        c.fill();
        c.restore();
    
        // 分針の描画
        c.save();
        c.beginPath();
        c.rotate(minutesAngle);
        c.fillRect(
            -handsWidth / 2,
            -handsWidth / 2,
            handsWidth,
            -clockRadius + clockRadius / 3
        );
        c.fill();
        c.restore();
    
        // 時針の描画
        c.save();
        c.beginPath();
        c.rotate(hoursAngle);
        c.fillRect(
            -handsWidth / 2,
            -handsWidth / 2,
            handsWidth,
            -clockRadius + clockRadius / 1.5
        );
        c.fill();
        c.restore();
        c.restore();
    
        // 反対側の描画
        if (level4) {
            c.save();
            c.globalAlpha = 0.7;  // 透明度を0.7に設定
            c.translate(c.canvas.width / 2, c.canvas.height / 2);
            c.rotate(numbersRotationAngle);
    
            c.save();
            // ぶつかってもゲームオーバーにならない間は透明度を0.7に設定
            if (!level4_gameOver) {
                c.globalAlpha = 0.3;
            } else {
                c.globalAlpha = 1;
            }
            c.fillStyle = "#808080";
            c.beginPath();
            c.rotate(secondsAngle + Math.PI); // 180度反対側に回転
            c.fillRect(
                -handsWidth / 2,
                -handsWidth / 2,
                handsWidth,
                -clockRadius + clockRadius / 5
            );
            c.fill();
            c.restore();
    
            c.save();
            // ぶつかってもゲームオーバーにならない間は透明度を0.7に設定
            if (!level4_gameOver) {
                c.globalAlpha = 0.3;
            } else {
                c.globalAlpha = 1;
            }
            
            c.fillStyle = "#808080";
            c.beginPath();
            c.rotate(minutesAngle + Math.PI); // 180度反対側に回転
            c.fillRect(
                -handsWidth / 2,
                -handsWidth / 2,
                handsWidth,
                -clockRadius + clockRadius / 3
            );
            c.fill();
            c.restore();
    
            c.restore();
            c.restore();
        }
    
        // 時計の中央の点を描画
        c.save();
        c.fillStyle = handsColor;
        c.beginPath();
        c.arc(c.canvas.width / 2, c.canvas.height / 2, clockRadius / 20, 0, 2 * Math.PI);
        c.fill();
        c.restore();
    }

    /**
     * プレイヤーが足場に着地したかどうかを判定
     */
    function isPlayerLandedOnPlatform(player, platform) {
        return (
            player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width
        );
    }

    /**
     * ゲームオーバーの条件
     */
    function isOver(){
        // 現在の時刻をendTimeに代入
        endTime = new Date().getTime();
        // startTimeとの差を計算して秒単位に変換
        let survivalTime = (endTime - startTime) / 1000;
        // ゲーム開始から5秒間は無敵
        if(!gameOver && survivalTime < 5){
            player.setAlpha(0.7);  // 透明度を更新
        } else {
            if(!gameOver){
                player.setAlpha(1);  // 5秒以上経過したら透明度を元に戻す
            }
            // 時計の針の角度とプレーヤーの高さからゲームオーバーか判定
            if (player.position.y >= 142) {
                if ((minutesAngle <= 0.08 - numbersRotationAngle && minutesAngle >= 0 - numbersRotationAngle) || (minutesAngle <= 2 * Math.PI - numbersRotationAngle && minutesAngle >= 2 * Math.PI - 0.08 - numbersRotationAngle)) {
                    game_Over();
                    gameOver = true;
                }
            }
            if(player.position.y >= 95) {
                if ((secondsAngle <= 0.08 - numbersRotationAngle && secondsAngle >= 0 - numbersRotationAngle) || (secondsAngle <= 2 * Math.PI - numbersRotationAngle && secondsAngle >= 2 * Math.PI - 0.08 - numbersRotationAngle)) {
                    game_Over();
                    gameOver = true;
                    
                }
            }
            if(level4_gameOver){
                if (player.position.y >= 142) {
                    if ((minutesAngle + Math.PI <= 0.08 - numbersRotationAngle && minutesAngle + Math.PI >= 0 - numbersRotationAngle) || (minutesAngle + Math.PI <= 2 * Math.PI - numbersRotationAngle && minutesAngle + Math.PI >= 2 * Math.PI - 0.08 - numbersRotationAngle)) {
                        game_Over();
                        gameOver = true;
                    }
                }
                if(player.position.y >= 95) {
                    if ((secondsAngle + Math.PI <= 0.08 - numbersRotationAngle && secondsAngle + Math.PI >= 0 - numbersRotationAngle) || (secondsAngle + Math.PI <= 2 * Math.PI - numbersRotationAngle && secondsAngle + Math.PI >= 2 * Math.PI - 0.08 - numbersRotationAngle)) {
                        game_Over();
                        gameOver = true;    
                    }
                }
            }
        }
    }

    /**
     * ゲームオーバー後の処理
     */
    function game_Over() {     
        if(!gameOver){
            explosion.set(player.position.x + (player.width / 2), player.position.y + (player.height / 2));
        }
        // ゲームオーバー時にプレイヤーの透明度を0にする
        player.setAlpha(0);  
    }

    /**
     * 白色のテクストを表示
     */
    function drawText(c, text, x, y, maxWidth) {
        c.textAlign = "center";
        c.font = "40px monospace";
        c.fillStyle = "#ffffff";
        c.fillText(text, x, y, maxWidth);
    }

    /**
     * 灰色のテクストを表示
     */
    function drawTextGray(c, text, x, y, maxWidth) {
        c.textAlign = "center";
        c.font = "40px monospace";
        c.fillStyle = "#808080";
        c.fillText(text, x, y, maxWidth);
    }

    /**
     * テクストの空欄に 0 を表示
     */
    function zeroPadding(number, count){
        // 配列を指定の桁数分の長さで初期化する
        let zeroArray = new Array(count);
        // 配列の要素を '0' を挟んで連結する（つまり「桁数 - 1」の 0 が連なる）
        let zeroString = zeroArray.join('0') + number;
        // 文字列の後ろから桁数分だけ文字を抜き取る
        return zeroString.slice(-count);
    }

    /**
     * データベースにスコアとユーザー名を挿入
     */
    document.getElementById('myForm').addEventListener('submit', function (event) {
        event.preventDefault(); // フォームのデフォルトの送信動作を防ぐ
    
        // フォームからユーザー名を取得
        let userName = document.getElementById('inputText').value;
    
        // データベースにデータを送信するためのAjaxリクエスト
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'insert.php', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
        // PHPに送信するデータ
        let data = 'userName=' + encodeURIComponent(userName) + '&gameScore=' + encodeURIComponent(gameScore);
    
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // データが正常に挿入された場合の処理
                console.log(xhr.responseText);
    
                // フォームを非表示にする
                document.getElementById('myForm').style.visibility = 'hidden';
            }
        };
    
        // リクエストを送信
        xhr.send(data);
    });
    
    // ゲームオーバーでなければ、1秒ごとにincreaseScore関数を実行
    setInterval(increaseScore, 1000);
    // 1秒ごとにincreaseScore関数を実行
    setInterval(increaseTime, 1000);
})();