<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>
<script>
import BScroll from 'better-scroll';

export default {
  props: {
    /**
     * 1 滚动的时候会派发scroll事件，会截流。
     * 2 滚动的时候实时派发scroll事件，不会截流。
     * 3 除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
     */
    probeType: {
      type: Number,
      default: 1,
    },
    /* 是否动画回弹事件 */
    isOpenBounce: {
      type: Boolean,
      default: true,
    },
    /* 点击列表是否派发click事件 */
    click: {
      type: Boolean,
      default: true,
    },
    /* 是否纵向滚动 */
    scrollY: {
      type: Boolean,
      default: true,
    },
    /* 是否横向滚动 */
    scrollX: {
      type: Boolean,
      default: false,
    },
    /* 自由滚动 */
    freeScroll: {
      type: Boolean,
      default: false,
    },
    /* 侦听滚动事件 */
    listenScroll: {
      type: Boolean,
      default: false,
    },
    /* 列表数据 */
    data: {
      type: Array,
      default: null,
    },
    /* 当数据更新后，刷新scroll的延时 */
    refreshDelay: {
      type: Number,
      default: 20,
    },
    /* picker */
    isWheel: {
      type: Boolean,
      default: false,
    },
    selectedIndex: {
      type: Number,
      default: 0,
    },
  },
  mounted() {
    // 保证在DOM渲染完毕后初始化better-scroll
    setTimeout(() => {
      this._initScroll();
    }, 20);
  },
  methods: {
    _initScroll() {
      if (!this.$refs.wrapper) {
        return;
      }
      // better-scroll的初始化
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click,
        scrollX: this.scrollX,
        scrollY: this.scrollY,
        freeScroll: this.freeScroll,
        bounce: this.isOpenBounce,
        wheel: this.isWheel
          ? {
              selectedIndex: this.selectedIndex,
              rotate: 0,
              adjustTime: 400,
              wheelWrapperClass: 'wheel-scroll',
              wheelItemClass: 'wheel-item',
            }
          : '',
      });

      //  日期选择器
      if (this.isWheel) {
        this.scroll.on('scrollEnd', () => {
          this.$emit('changeDate', this.scroll.getSelectedIndex());
        });
      }

      // 是否派发滚动事件
      if (this.$listeners.scroll) {
        this.scroll.on('scroll', pos => {
          this.$emit('scroll', pos);
        });
      }

      // 是否派发滚动到底部事件，用于上拉加载
      if (this.$listeners.pullup) {
        this.scroll.on('scrollEnd', () => {
          // 滚动到底部
          if (this.scroll.y <= this.scroll.maxScrollY + 50) {
            this.$emit('pullup');
          }
        });
      }

      // 滚动停止事件
      if (this.$listeners.scrollStop) {
        this.scroll.on('scrollEnd', () => {
          this.$emit('scrollStop');
        });
      }

      // 下拉事件
      if (this.$listeners.pulldown) {
        this.scroll.on('touchEnd', pos => {
          if (pos.y > 50) {
            this.$emit('pulldown');
          }
        });
      }

      // 列表滚动开始之前的事件
      if (this.$listeners.beforeScrollStart) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScrollStart');
        });
      }

      // 列表滚动开始的事件
      if (this.$listeners.beforeScrollStart) {
        this.scroll.on('scrollStart', () => {
          this.$emit('scrollStart');
        });
      }
    },
    disable() {
      this.scroll && this.scroll.disable();
    },
    enable() {
      this.scroll && this.scroll.enable();
    },
    /* dom结构刷新时候需要刷新 */
    refresh() {
      this.scroll && this.scroll.refresh();
    },
    delayRefresh() {
      setTimeout(() => {
        this.refresh();
      }, this.refreshDelay);
    },
    /**
     * 滚动到位置
     * {Number} x 横轴坐标
     * {Number} y 纵轴坐标
     * {Number} time 滚动动画执行的时长（单位 ms）
     * {Object} easing 缓动函数，一般不建议修改，如果想修改，参考源码中的 ease.js 里的写法
     */
    scrollTo(x = 0, y, time = 0, easing) {
      this.scroll && this.scroll.scrollTo(x, -y, time, easing);
    },
    /**
     * 滚动到元素
     * {DOM | String} el 滚动到的目标元素, 如果是字符串，则内部会尝试调用 querySelector 转换成 DOM 对象。
     * {Number} time 滚动动画执行的时长（单位 ms）
     * {Number | Boolean} offsetX 相对于目标元素的横轴偏移量，如果设置为 true，则滚到目标元素的中心位置
     * {Number | Boolean} offsetY 相对于目标元素的纵轴偏移量，如果设置为 true，则滚到目标元素的中心位置
     * {Object} easing 缓动函数，一般不建议修改，如果想修改，参考源码中的 ease.js 里的写法
     */
    scrollToElement(el, time = 0, offsetX = 0, offsetY = 0, easing) {
      this.scroll && this.scroll.scrollToElement(el, time, offsetX, offsetY, easing);
    },
  },
  watch: {
    // 监听数据的变化，延时refreshDelay时间后调用refresh方法重新计算，保证滚动效果正常
    data() {
      setTimeout(() => {
        this.refresh();
      }, this.refreshDelay);
    },
  },
};
</script>
