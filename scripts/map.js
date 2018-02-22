class BotMap {
    /**
     * 创建BotMap实例
     * @param {number} rows - 行数，对应坐标系y轴
     * @param {number} cols - 列数，对应坐标系x轴
     * @param {number} size - 方格边长
     * @memberof BotMap
     */
    constructor(rows, cols, size) {
        this.size = size;
        this.container = document.getElementById('map');

        this.init(rows, cols);
    }

    init(rows, cols) {
        let innerText = '<div class="col-nums clearfix"><div class="col-num"></div>';

        // 添加列标
        for (let i = 1; i <= cols; i++) {
            innerText += `<div class="col-num">${i}</div>`
        }
        innerText += '</div>';

        for (let i = 1; i <= rows; i++) {
            // 添加行标
            innerText += `<div class="row clearfix"><div class="row-num">${i}</div>`;
            for (let j = 0; j < cols; j++) {
                innerText += '<div class="cell"></div>';
            }
            innerText += '</div>';
        }

        this.container.innerHTML = innerText;

        const cells = this.container.getElementsByClassName('cell');
        this.cells = [];
        // 缓存方格，方便后续更改方格类型
        // 二维数组cells[rows][cols]
        for (let i = 0; i < rows; i++) {
            this.cells.push(Array.prototype.slice.call(cells, i*cols, (i+1) * cols));
        }

        this.rows = rows;
        this.cols = cols;
    }

    // 获取从当前位置往指定方向走指定步数后的位置
    getPosition(pos, direction, step) {
        let x = pos.x, y = pos.y;

        switch(direction) {
            case TOP:
                y -= step;
                break;
            case RIGHT:
                x += step;
                break;
            case BOTTOM:
                y += step;
                break;
            case LEFT:
                x -= step;
        }

        const end = {x, y};
        // 确定目标位置在棋盘中后返回位置
        if (this.verifyPosition(end)) return end;
    }

    randomWall() {
        for (let i = 0; i < 10; i++) {
            const x = floor(random() * this.cols + 1);
            const y = floor(random() * this.rows + 1);

            this.setWall({x, y});
        }
    }

    setWall(pos) {
        let cell = this.cells[pos.y - 1][pos.x - 1];
        cell.setAttribute('data-type', 'wall');
    }

    setColor(pos, color) {
        const cell = this.cells[pos.y-1][pos.x-1];
        if (this.isWall(pos.x, pos.y)) {
            cell.style.backgroundColor = color;
        } else {
            throw Error('前方没有墙，无法粉刷');
        }
    }

    isWall(x, y) {
        const cell = this.cells[y - 1][x - 1];
        return cell.getAttribute('data-type') === 'wall';
    }

    verifyPosition(pos) {
        if (pos.x > 0 && pos.x <= this.cols && pos.y > 0 && pos.y <= this.rows) {
            return true;
        } else {
            throw Error('超出边界');
        }
    }

    verifyPath(start, end) {
        if (start.x === end.x) {
            let max = Math.max(start.y, end.y),
                min = Math.min(start.y, end.y);

            for (let i = min + 1; i <= max; i++) {
                if (this.isWall(start.x, i)) {
                    throw Error('路径上有墙');
                }
            }
        } else {
            let max = Math.max(start.x, end.x),
                min = Math.min(start.x, end.x);

            for (let i = min + 1; i <= max; i++) {
                if (this.isWall(i, start.y)) {
                    throw Error('路径上有墙');
                }
            }
        }

        return true;
    }

    /**
     * 寻找从start到end的路径
     * @param {object} start - 起始位置
     * @param {object} end - 结束位置
     * @returns - 返回路径数组
     * @memberof BotMap
     */
    findPath(start, end) {
        const openList = [];    // 开启列表
        const closeList = [];   // 关闭列表
        let resultIndex;

        openList.push({x: start.x, y: start.y, G: 0});

        do {
            const currentPoint = openList.pop();
            closeList.push(currentPoint);
            const surrounds = this.getSurroundPoint(currentPoint);
            for (let i = 0; i < 4; i++) {
                const item = surrounds[i];
                if (item.x > 0 && item.y > 0 && item.x <= this.cols &&
                    item.y <= this.rows &&
                    !this.isWall(item.x, item.y) &&
                    existList(item, closeList) === false) {
                        const g = currentPoint.G + 1;
                        const index = existList(item, openList);
                        if (index !== false) {    // 在开启列表中
                            // 当前点的G值更小, 更新开启列表中该点的属性
                            if (g < openList[index].G) {
                                openList[index].parent = currentPoint;
                                openList[index].G = g;
                                openList[index].F = g + openList[index].H;
                            }
                        } else {
                            item.H = abs(end.x - item.x) + abs(end.y - item.y);
                            item.G = g;
                            item.F = item.H + item.G;
                            item.parent = currentPoint;
                            openList.push(item);
                        }
                    }
            }

            // 开启列表为空时表示没有通路，结果为空
            if (openList.length === 0) break;

            // 根据point的F值大小对openList升序排序
            openList.sort(sortF);

            // 确定结束点是否包含在openList中
            resultIndex = existList(end, openList);
        } while (resultIndex === false)

        const result = [];
        if (resultIndex !== false) {
            let currentPoint = openList[resultIndex];
            do {
                result.unshift({
                    x: currentPoint.x,
                    y: currentPoint.y
                });
                currentPoint = currentPoint.parent;
            } while (currentPoint.x != start.x || currentPoint.y != start.y)
        }

        return result;
    }

    /**
     * 获取指定点周围的点，本程序不能斜向移动，所以只返回上下左右四个点
     * @param {object} currentPoint 
     * @returns
     * @memberof BotMap
     */
    getSurroundPoint(currentPoint) {
        const {x, y} = currentPoint;
        return [
            {x: x+1, y: y},
            {x: x-1, y: y},
            {x: x, y: y-1},
            {x: x, y: y+1}
        ];
    }
}

function existList(point, list) {
    for (let i = 0, len = list.length; i < len; i++) {
        if (point.x === list[i].x && point.y === list[i].y) {
            return i;
        }
    }
    return false;
}

function sortF(a, b) {
    return b.F - a.F;
}
