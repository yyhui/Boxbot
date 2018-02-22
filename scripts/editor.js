class Editor {
    constructor() {
        this.textarea = document.getElementById('commands');
        this.lines = document.querySelector('.line-nums');
        this.textarea.addEventListener('input', this.update.bind(this));
        this.textarea.addEventListener('scroll', this.scroll.bind(this));
    }

    getCode() {
        const codes = this.textarea.value.split('\n');
        return codes;
    }

    update() {
        const lines = this.textarea.value.match(/\n/g);
        const count = lines ? lines.length + 1 : 1;
        let html = '';

        for (let i = 1; i <= count; i++) {
            html += `<div class="line-num">${i}</div>`
        }

        this.lines.innerHTML = html;
    }

    scroll() {
        this.lines.style.top = -this.textarea.scrollTop + 'px';
    }

    scrollTo(line) {
        this.textarea.scrollTop = line * 20;
    }

    getLines() {
        return this.lines.getElementsByClassName('line-num');
    }

    setFlag(line, flag) {
        this.getLines()[line].className += ' ' + flag;
    }

    clearFlag() {
        let elem = this.lines.querySelector('.success');
        if (elem) elem.className = 'line-num';

        elem = this.lines.querySelector('.error');
        if (elem) elem.className = 'line-num';
    }
}
