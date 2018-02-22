class Executor {
    constructor() {
        this.map = new BotMap(30, 30, 20);
        this.square = new Square(1, 1);
        this.editor = new Editor();
        this.tasks = [];
        this.lineNum = 0;
        this.running = false;

        this.directions = {
            top: TOP, rig: RIGHT, bot: BOTTOM, lef: LEFT
        };

        this.commands = [
            {
                pattern: /^go(\s(\d+))?$/i,
                handler: function(params) {
                    const step = parseInt(params[1]) || 1;
                    const animator = this.move(step, this.square.direction);

                    animator.start(this.taskloop.bind(this));
                }
            },

            {
                pattern: /^tun\s(lef|rig|bac)$/i,
                handler: function(params) {
                    const angle = {lef: -90, rig: 90, bac: 180}[params[0]];
                    const animator = this.turn(angle);

                    animator.start(this.taskloop.bind(this));
                }
            },

            {
                pattern: /^tra\s(top|rig|bot|lef)(\s(\d+))?$/i,
                handler: function(params) {
                    const step = parseInt(params[2]) || 1;
                    const animator = this.move(step, this.directions[params[0]]);

                    animator.start(this.taskloop.bind(this));
                }
            },

            {
                pattern: /^mov\s(top|rig|bot|lef)(\s(\d+))?$/i,
                handler: function(params) {
                    const step = parseInt(params[2]) || 1;
                    const angle = this.directions[params[0]] - this.square.direction;

                    const a1 = this.turn(angle);
                    const a2 = this.move(step, this.square.direction);

                    a1.start(() => a2.start(this.taskloop.bind(this)));
                }
            },

            {
                pattern: /^build$/i,
                handler: function() {
                    this.build();
                    this.taskloop();
                }
            },

            {
                pattern: /^bru\s(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})$/i,
                handler: function(params) {
                    this.brush(params[0]);
                    this.taskloop();
                }
            },

            {
                pattern: /^mov\sto\s(\d+),\s*(\d+)/i,
                handler: function(params) {
                    const p = {x: parseInt(params[0]), y: parseInt(params[1])};
                    
                    if (p.x === this.square.x && p.y === this.square.y) {
                        this.taskloop();
                    } else {
                        this.moveTo(p);
                    }
                }
            }
        ]
    }

    moveTo(end) {
        if (!this.map.verifyPosition(end) && this.map.isWall(end.x, end.y)) {
            throw Error(`无法移动到${end.x}, ${end.y}`);
        }
        const result = this.map.findPath({x: this.square.x, y: this.square.y}, end);
        if (result.length === 0) {
            throw Error(`无法移动到${end.x}, ${end.y}`);
        }

        const animatorQueue = new AnimationQueue();
        const self = this;

        for (let i = 0, len = result.length; i < len; i++) {
            animatorQueue.append.apply(animatorQueue, self.square.moveToPos(result[i]));
        }
        animatorQueue.append(self.taskloop.bind(self));
        animatorQueue.flush();
    }

    move(step, direction) {
        const start = { x: this.square.x, y: this.square.y };
        const end = this.map.getPosition(start, direction, step);

        if (end && this.map.verifyPath(start, end)) {
            return this.square.move(step, direction);
        }
    }

    turn(angle) {
        return this.square.turn(angle);
    }

    build() {
        const pos = this.map.getPosition({
            x: this.square.x,
            y: this.square.y
        }, this.square.direction, 1);

        if (this.map.verifyPosition(pos) && !this.map.isWall(pos.x, pos.y)) {
            this.map.setWall(pos);
        } else {
            throw Error('前方已经是墙');
        }
    }

    brush(color) {
        const pos = this.map.getPosition({
            x: this.square.x,
            y: this.square.y
        }, this.square.direction, 1);

        this.map.setColor(pos, color);
    }

    exec() {
        this.tasks = this.editor.getCode();
        this.lineNum = 0;
        this.taskloop();
    }

    taskloop() {
        const string = this.tasks.shift();
        if (string) {
            this.setLineNum('success');
            let match = null;
            for (let i = 0, len = this.commands.length; i < len; i++) {
                const command = this.commands[i];
                match = string.match(command.pattern);

                if (match) {
                    match.shift();
                    try {
                        this.lineNum += 1;
                        command.handler.bind(this)(match);
                    } catch(e) {
                        this.lineNum -= 1;
                        this.setLineNum('error');
                        console.log(e.message);
                        return;
                    }
                    break;
                }
            }

            if (match === null) {
                this.setLineNum('error');
                console.log('无匹配');
            }
        }
    }

    setLineNum(flag) {
        this.editor.clearFlag();
        this.editor.setFlag(this.lineNum, flag);
    }
}

window.onload = function() {
    var executor = new Executor(),
        btn = document.querySelector('button'),
        orderTxt = document.querySelector('#commands'),
        order;

    executor.map.randomWall();
    btn.onclick = function() {
        executor.exec();
    }
}
