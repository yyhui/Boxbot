class Square {
    /**
     * 创建Square实例
     * @param {number} x - 方块在棋盘x轴位置
     * @param {number} y - 方块在棋盘y轴位置
     * @param {number} [direction=TOP] - 方块朝向
     * @param {number} [size=40] - 方块大小
     * @param {number} [duration=1000] - 方块在棋盘中移动一格或者旋转90度的时间
     * @memberof Square
     */
    constructor(x, y, direction=TOP, size=20, duration=500) {
        this.square = document.querySelector('.square');
        this.square.style.top = y * size + 'px';
        this.square.style.left = x * size + 'px';

        this.x = x;
        this.y = y;
        this.direction = direction;
        this.size = size;
        this.duration = duration;
    }

    /**
     * 方块朝指定方向移动
     * @param {number} step - 方块移动步数
     * @param {number} direction - 方块移动方向
     * @memberof Square
     */
    move(step, direction) {
        let animator, diff = step * this.size, duration = step * this.duration;
        if (direction === TOP) {
            animator = this.moveAnimator(this.y * this.size, -diff, 'top', duration);
            this.y -= step;
        } else if (direction === RIGHT) {
            animator = this.moveAnimator(this.x * this.size, diff, 'left', duration)
            this.x += step;
        } else if (direction === BOTTOM) {
            animator = this.moveAnimator(this.y * this.size, diff, 'top', duration);
            this.y += step;
        } else if (direction === LEFT) {
            animator = this.moveAnimator(this.x * this.size, -diff, 'left', duration);
            this.x -= step;
        }
        return animator;
    }

    /**
     * 方块旋转指定角度
     * @param {number} angle - 旋转角度
     * @memberof Square
     */
    turn(angle) {
        const animator = this.rotateAnimator(angle, abs(angle) / 90 * this.duration);
        this.direction = (this.direction + angle) % 360;
        if (this.direction < 0) this.direction += 360;

        return animator;
    }

    /**
     * 从方块当前位置移动到指定位置
     * 返回动画数组
     * @param {object} end 
     * @returns 
     * @memberof Square
     */
    moveToPos(end) {
        const self = this;
        const animators = [];
        let direction, step;
        if (self.x === end.x && self.y < end.y) {
            direction = BOTTOM;
            step = abs(end.y - self.y);
        } else if (self.x === end.x && self.y > end.y) {
            direction = TOP;
            step = abs(end.y - self.y);
        } else if (self.x < end.x && self.y === end.y) {
            direction = RIGHT;
            step = abs(end.x - self.x);
        } else {
            direction = LEFT;
            step = abs(end.x - self.x);
        }

        if (self.direction !== direction) {
            const a1 = self.turn(direction - self.direction);
            animators.push(a1);
        }
        animators.push(self.move(step, direction));

        return animators;
    }

    moveAnimator(start, diff, type, duration) {
        const self = this;
        return new Animator(duration, function(p) {
            const t = start + diff * p;

            self.square.style[type] = t + 'px';
        }, Easing.easeInOutSine);
    }

    rotateAnimator(diff, duration) {
        const self = this, start = this.direction;
        return new Animator(duration, function(p) {
            const t = start + diff * p;

            self.square.style.transform = `rotate(${t}deg)`;
        }, Easing.easeInOutSine);
    }
}
