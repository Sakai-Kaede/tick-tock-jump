/**
 * 座標を管理するためのクラス
 */
class Position {
    /**
     * @constructor
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Player クラス
 */
class Player {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} c - 描画などに利用する 2D コンテキスト
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {number} CANVAS_HEIGHT - キャンバスの大きさ
     */
    constructor(c, x, y, width, height, CANVAS_HEIGHT) {
        this.position = {
            x: x,
            y: y
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.c = c;
        this.CANVAS_HEIGHT = CANVAS_HEIGHT;

        this.width = width;
        this.height = height;

        this.isJumping = true;
        this.isFalling = false;
        this.alpha = 1.0;  // 透明度の初期値
        this.gravity = 0.1;
        this.jumpHeight = 5.5;  // 大ジャンプの高さ
        this.smallJumpHeight = 4.5;  // 小ジャンプの高さ

        this.radius = Math.min(width, height) / 2;  // 半径を幅と高さの最小値の半分に設定
    }

    draw() {
        this.c.save();
        this.c.globalAlpha = this.alpha;
        this.c.fillStyle = '#ff8c00';

        // 円形を描画
        this.c.beginPath();
        this.c.arc(this.position.x + this.radius, this.position.y + this.radius, this.radius, 0, 2 * Math.PI);
        this.c.fill();

        this.c.restore();
    }

    update() {
        this.position.y += this.velocity.y;
        this.draw();

        if (this.position.y + this.height + this.velocity.y <= this.CANVAS_HEIGHT) {
            this.velocity.y += this.gravity;
        } else {
            this.velocity.y = 0;
            this.isJumping = false;
            this.isFalling = false;
        }
    }

    jump(isBigJump) {
        if (!this.isJumping && !this.isFalling && !this.gameOver) {
            this.isJumping = true;
            this.velocity.y = -(isBigJump ? this.jumpHeight : this.smallJumpHeight);
        }
    }

    fall() {
        if (this.isJumping && this.velocity.y >= 0) {
            this.isJumping = false;
            this.isFalling = true;
        }
    }

    setAlpha(newAlpha) {
        this.alpha = newAlpha;
    }
}

/**
 * Player の足場になるクラス
 */
class Platform {
    constructor(c, x, y, width, height) {
        this.c = c;
        this.position = {
            x: x,
            y: y
        };
        this.width = width;
        this.height = height;
    }

    draw() {
        this.c.fillStyle = 'white';
        this.c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

/**
 * 背景の星を表示するクラス
 */
class BackgroundStar {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} c - 描画などに利用する 2D コンテキスト
     * @param {number} size - 星の大きさ（幅・高さ）
     * @param {number} speed - 星の移動速度
     * @param {string} [color='#ffffff'] - 星の色
     */
    constructor(c, size, color = "#ffffff"){
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.c = c;
        /**
         * 星の大きさ（幅・高さ）
         * @type {number}
         */
        this.size = size;
        /**
         * 星を fill する際の色
         * @type {string}
         */
        this.color = color;
        /**
         * 自身の座標
         * @type {Position}
         */
        this.position = null;
    }

    /**
     * 星を設定する
     * @param {number} x - 星を発生させる X 座標
     * @param {number} y - 星を発生させる Y 座標
     */
    set(x, y){
        // 引数を元に位置を決める
        this.position = new Position(x, y);
    }

    /**
     * 星を更新する
     */
    update(){
        // 星の色を設定する
        this.c.fillStyle = this.color;

        // 星の矩形を描画する
        this.c.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );
        // もし画面下端よりも外に出てしまっていたら上端側に戻す
        if(this.position.y + this.size > this.c.canvas.height){
            this.position.y = -this.size;
        }
    }
}

/**
 * 爆発エフェクトクラス
 */
class Explosion {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} c - 描画などに利用する 2D コンテキスト
     * @param {number} radius - 爆発の広がりの半径
     * @param {number} count - 爆発の火花の数
     * @param {number} size - 爆発の火花の大きさ（幅・高さ）
     * @param {number} timeRange - 爆発が消えるまでの時間（秒単位）
     * @param {string} [color='#ff4500'] - 爆発の色
     */
    constructor(c, radius, count, size, timeRange, color = '#ff4500'){
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.c = c;
        /**
         * 爆発の生存状態を表すフラグ
         * @type {boolean}
         */
        this.life = false;
        /**
         * 爆発を fill する際の色
         * @type {string}
         */
        this.color = color;
        /**
         * 自身の座標
         * @type {Position}
         */
        this.position = null;
        /**
         * 爆発の広がりの半径
         * @type {number}
         */
        this.radius = radius;
        /**
         * 爆発の火花の数
         * @type {number}
         */
        this.count = count;
        /**
         * 爆発が始まった瞬間のタイムスタンプ
         * @type {number}
         */
        this.startTime = 0;
        /**
         * 爆発が消えるまでの時間
         * @type {number}
         */
        this.timeRange = timeRange;
        /**
         * 火花のひとつあたりの最大の大きさ（幅・高さ）
         * @type {number}
         */
        this.fireBaseSize = size;
        /**
         * 火花のひとつあたりの大きさを格納する
         * @type {Array<Position>}
         */
        this.fireSize = [];
        /**
         * 火花の位置を格納する
         * @type {Array<Position>}
         */
        this.firePosition = [];
        /**
         * 火花の進行方向を格納する
         * @type {Array<Position>}
         */
        this.fireVector = [];
    }

    /**
     * 爆発エフェクトを設定する
     * @param {number} x - 爆発を発生させる X 座標
     * @param {number} y - 爆発を発生させる Y 座標
     */
    set(x, y){
        // 火花の個数分ループして生成する
        for(let i = 0; i < this.count; ++i){
            // 引数を元に位置を決める
            this.firePosition[i] = new Position(x, y);
            // ランダムに火花が進む方向（となるラジアン）を決める
            let vr = Math.random() * Math.PI * 2.0;
            // ラジアンを元にサインとコサインを生成し進行方向に設定する
            let s = Math.sin(vr);
            let c = Math.cos(vr);
            // 進行方向ベクトルの長さをランダムに短くし移動量をランダム化する
            let mr = Math.random();
            this.fireVector[i] = new Position(c * mr, s * mr);
            // 火花の大きさをランダム化する
            this.fireSize[i] = (Math.random() * 0.5 + 0.5) * this.fireBaseSize;
        }
        // 爆発の生存状態を設定
        this.life = true;
        // 爆発が始まる瞬間のタイムスタンプを取得する
        this.startTime = Date.now();
    }

    /**
     * 爆発エフェクトを更新する
     */
    update() {
        // 生存状態を確認する
        if (this.life !== true) {
            return;
        }

        // 現在の透明度を保存
        const originalAlpha = this.c.globalAlpha;

        // 爆発エフェクト用の色を設定する
        this.c.fillStyle = this.color;
        this.c.globalAlpha = 0.5;

        // 爆発が発生してからの経過時間を求める
        let time = (Date.now() - this.startTime) / 1000;
        // 爆発終了までの時間で正規化して進捗度合いを算出する
        let ease = simpleEaseIn(1.0 - Math.min(time / this.timeRange, 1.0));
        let progress = 1.0 - ease;

        // 進捗度合いに応じた位置に円形の火花を描画する
        for (let i = 0; i < this.firePosition.length; ++i) {
            // 火花が広がる距離
            let d = this.radius * progress;
            // 広がる距離分だけ移動した位置
            let x = this.firePosition[i].x + this.fireVector[i].x * d;
            let y = this.firePosition[i].y + this.fireVector[i].y * d;
            // 進捗を描かれる大きさにも反映させる
            let s = 1.0 - progress;

            // 円形を描画する
            this.c.beginPath();
            this.c.arc(x, y, this.fireSize[i] * s / 2, 0, Math.PI * 2);
            this.c.fill();
        }

        // 透明度を元に戻す
        this.c.globalAlpha = originalAlpha;

        // 進捗が 100% 相当まで進んでいたら非生存の状態にする
        if (progress >= 1.0) {
            this.life = false;
        }
    }
}

function simpleEaseIn(t){
    return t * t * t * t;
}

/**
 * 星形爆発エフェクトクラス
 */
class StarExplosion extends Explosion {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} c - 描画などに利用する 2D コンテキスト
     * @param {number} radius - 爆発の広がりの半径
     * @param {number} count - 爆発の火花の数
     * @param {number} size - 爆発の火花の大きさ（幅・高さ）
     * @param {number} timeRange - 爆発が消えるまでの時間（秒単位）
     * @param {string} [color='#ff4500'] - 爆発の色
     */
    constructor(c, radius, count, size, timeRange, color = '#ffd700') {
        super(c, radius, count, size, timeRange, color);
    }

     /**
     * 爆発エフェクトを更新する
     */
    update() {
        // 生存状態を確認する
        if (this.life !== true) {
            return;
        }

        // 現在の透明度を保存
        const originalAlpha = this.c.globalAlpha;

        // 星形爆発エフェクト用の色を設定する
        this.c.fillStyle = this.color;
        this.c.globalAlpha = 0.5;

        // 爆発が発生してからの経過時間を求める
        let time = (Date.now() - this.startTime) / 1000;
        // 爆発終了までの時間で正規化して進捗度合いを算出する
        let ease = simpleEaseIn(1.0 - Math.min(time / this.timeRange, 1.0));
        let progress = 1.0 - ease;

        // 進捗度合いに応じた位置に星形の火花を描画する
        for (let i = 0; i < this.firePosition.length; ++i) {
            // 星形の座標を計算
            let starX = this.firePosition[i].x + this.fireVector[i].x * this.radius * progress;
            let starY = this.firePosition[i].y + this.fireVector[i].y * this.radius * progress;

            // 星形のパスを生成
            let starPath = this.createStarPath(
                starX,
                starY,
                this.fireSize[i] * 0.5 * (1.0 - progress), // 星の大きさを進捗に応じて縮小
                5, // 5つの角を持つ星形
                2 // 星の放射状の長さ
            );

            // 星形を描画する
            this.c.beginPath();
            this.c.moveTo(starPath[0].x, starPath[0].y);
            for (let j = 1; j < starPath.length; ++j) {
                this.c.lineTo(starPath[j].x, starPath[j].y);
            }
            this.c.closePath();
            this.c.fill();
        }

        // 透明度を元に戻す
        this.c.globalAlpha = originalAlpha;

        // 進捗が 100% 相当まで進んでいたら非生存の状態にする
        if (progress >= 1.0) {
            this.life = false;
        }
    }

    /**
     * 星形のパスを生成する
     * @param {number} x - 星の中心の X 座標
     * @param {number} y - 星の中心の Y 座標
     * @param {number} size - 星の大きさ（半径）
     * @param {number} points - 星の角の数
     * @param {number} length - 星の放射状の長さ
     * @returns {Array<Position>} - 星形のパスを表す座標の配列
     */
    createStarPath(x, y, size, points, length) {
        let angle = (Math.PI * 2) / points;
        let starPath = [];

        for (let i = 0; i < points; i++) {
            let outerX = x + Math.cos(angle * i) * size;
            let outerY = y + Math.sin(angle * i) * size;
            starPath.push({ x: outerX, y: outerY });

            let innerX = x + Math.cos(angle * i + angle / 2) * (size / length);
            let innerY = y + Math.sin(angle * i + angle / 2) * (size / length);
            starPath.push({ x: innerX, y: innerY });
        }

        return starPath;
    }
}