class Easing {
    static easeOutSine(x) {
        return sin(x * PI / 2);
    }

    static easeInOutSine(x) {
		return -(cos(PI * x) - 1) / 2;
    }
    
    static easeOutElastic(x) {
        return sin(x * PI / 2);
    }
}

/**
 * 动画类，实现动画效果
 * @class Animator
 */
class Animator {
    /**
     * 创建Animator实例。
     * @param {number} duration - 动画持续时间
     * @param {function} progress - 动画进程
     * @param {function} [easing=p => p] - 动画算子
     * @memberof Animator
     */
    constructor(duration, progress, easing=p => p) {
        this.duration = duration;
        this.progress = progress;
        this.easing = easing;
    }

    /**
     * 启动动画
     * @param {bool|function} finished - 结束标志，Bool值或者执行函数
     * @memberof Animator
     */
    start(finished) {
        const startTime = Date.now(), duration = this.duration, self = this;

        requestAnimationFrame(function step() {
            // 动画进程，范围为0..1
            // 用以确定动画进程执行到哪里
            const p = (Date.now() - startTime) / duration;
            // 是否有下一步的标记
            let next = true;

            if (p < 1.0) {  // 没有到终点
                self.progress(self.easing(p));
            } else {
                if (typeof finished === 'function') {
                    next = finished() === false;
                } else {
                    next = finished === false;
                }

                if (!next) {    // 没有下一步，将元素放在目标位置
                    self.progress(self.easing(1.0));
                } else {
                    // 重新计算开始时间
                    startTime += duration;
                    self.progress(self.easing(p));
                }
            }

            // 进入下一步动画渲染
            if (next) requestAnimationFrame(step);
        });
    }
}

/**
 * 动画执行队列类
 * @class AnimationQueue
 */
class AnimationQueue {
    /**
     * 创建AnimationQueue实例。
     * @param {Array} [animators=[]] - 需要执行的动画数组，默认值为空数组
     * @memberof AnimationQueue
     */
    constructor(animators=[]) {
        this.animators = animators;
    }

    /**
     * 添加需要执行的动画到队列中
     * @param {Animator|function} args - 可变长参数，动画类或者动画函数
     * @memberof AnimationQueue
     */
    append(...args) {
        this.animators.push.apply(this.animators, args);
    }

    /**
     * 执行队列动画
     * @memberof AnimationQueue
     */
    flush() {
        if (this.animators.length) {
            const self = this;

            function play() {
                // 获取需要执行的动画
                const animator = self.animators.shift();

                if (animator instanceof Animator) {
                    // 执行动画类动作
                    animator.start(function() {
                        // 判断是否还有动画需要执行
                        if (self.animators.length) {
                            play();
                        }
                    });
                } else {
                    // 在本AnimationQueue队列中执行动画函数
                    animator.apply(self);
                    if (self.animators.length) {
                        play();
                    }
                }
            }
            play();
        }
    }
}
