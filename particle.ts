export interface Point {
    pointX: number;
    pointY: number;
}

export class Particle {

    particle = [];//存储粒子的数组
    mousePosition: Point;//鼠标位置
    isMouseDown: boolean = false;//是否按下鼠标
    isMouseIn: boolean = false;//鼠标是否移入canvas
    options = {
        particleAmount: 50,//粒子数量
        distance: 200,//粒子连线的最大距离
        particleOption: {
            speed: 1.5,//粒子速度
            color: 'rgb(32, 245, 245)',//粒子颜色
            radius: 2,//粒子半径
        }
    }
    
    constructor(private canvas: HTMLCanvasElement) { }
    
    ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');

    init() {//初始化生成点
        this.setSize(this.canvas);
        for (let i = 0; i < this.options.particleAmount; i++) {
            this.particle.push(new SingleParticle(this.options.particleOption))
        };
        this.loop(this.ctx);
    }

    setSize(canvas) {//设置画布尺寸
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    getDistance(point1: Point, point2: Point) {//计算两点间距离
        return Math.sqrt(Math.pow(point1.pointX - point2.pointX, 2) + Math.pow(point1.pointY - point2.pointY, 2));
    }

    linePoint(target: Point) {//连接近距离的点
        for (let i = 0; i < this.options.particleAmount; i++) {
            let distance = this.getDistance(target, this.particle[i]);
            let opacity = 1 - distance / this.options.distance;
            if (opacity > 0) {
                this.ctx.lineWidth = 0.5;
                this.ctx.strokeStyle = "rgba(32, 245, 245," + opacity + ")";
                this.ctx.beginPath();
                this.ctx.moveTo(target.pointX, target.pointY);
                this.ctx.lineTo(this.particle[i].pointX, this.particle[i].pointY);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }
    }

    loop(ctx) {//随着屏幕刷新绘制点
        this.setSize(this.canvas);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        for (let i = 0; i < this.options.particleAmount; i++) {
            if (this.isMouseIn) {
                this.changeVector(i);
            }
            this.particle[i].position();
            this.linePoint(this.particle[i])
            this.particle[i].draw(this.ctx);
        }
        window.requestAnimationFrame(() => this.loop(ctx));

    }

    changeVector(index) {
        let distance = this.getDistance(this.mousePosition, this.particle[index]);
        if (distance <= 100) {
            let x = this.mousePosition.pointX - this.particle[index].pointX;
            let y = this.mousePosition.pointY - this.particle[index].pointY;
            let cosAngle = x / distance;//运动角度的余弦值
            let sinAngle = y / distance;//运动角度的正弦值
            let speed = this.options.particleOption.speed;
            if (this.isMouseDown) {//按下鼠标，反向运动
                this.particle[index].vectorX = -5 * Math.random() * speed * cosAngle;
                this.particle[index].vectorY = -5 * Math.random() * speed * sinAngle;
            } else {//粒子靠近鼠标
                this.particle[index].vectorX = speed * cosAngle;
                this.particle[index].vectorY = speed * sinAngle;
            }
        }
    }

    onMouseDown() {
        this.isMouseIn = true;
        this.isMouseDown = true;
    }

    onMouseUp() {
        this.isMouseDown = false;
    }

    onMouseMove(position) {
        this.mousePosition = position;
        this.isMouseIn = true;
    }

    onMouseEnter() {
        this.isMouseIn = true;
    }

    onMouseOut() {
        this.isMouseIn = false;
        this.mousePosition = undefined;
    }

}


class SingleParticle {
    pointX: number;//生成点横坐标
    pointY: number;//生成点纵坐标
    vectorX: number;//x方向的速度
    vectorY: number;//y方向的速度
    angle: number;//粒子运动的方向
    color: string;//粒子的颜色
    radius: number;//粒子半径
    constructor(private option) {
        this.pointX = Math.random() * window.innerWidth;
        this.pointY = Math.random() * window.innerHeight;
        this.angle = Math.floor(Math.random() * 360);
        this.vectorX = option.speed * Math.cos(this.angle);
        this.vectorY = option.speed * Math.sin(this.angle);
        this.color = option.color;
        this.radius = option.radius + Math.random();
    }

    border() {//边界判断
        //粒子超出左右边，改变运动方向
        if (this.pointX <= 0 || this.pointX >= window.innerWidth) {
            this.vectorX *= -1;
        }
        //粒子超出上下边，改变运动方向
        if (this.pointY <= 0 || this.pointY >= window.innerHeight) {
            this.vectorY *= -1;
        }
        //当屏幕尺寸改变时，超出屏幕的粒子，位置移动到屏幕边
        if (this.pointX < 0) {
            this.pointX = 0;
        }
        if (this.pointY < 0) {
            this.pointY = 0;
        }
        if (this.pointX > window.innerWidth) {
            this.pointX = window.innerWidth;
        }
        if (this.pointY > window.innerHeight) {
            this.pointY = window.innerHeight;
        }
    }

    position() {//改变粒子位置
        this.border();
        this.pointX += this.vectorX;
        this.pointY += this.vectorY;
    }

    draw(ctx) {//绘制粒子
        ctx.beginPath();
        ctx.arc(this.pointX, this.pointY, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }

}