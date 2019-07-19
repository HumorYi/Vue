// import Dep from './Dep'
// import Watcher from './Watcher'

const isObject = (data) => Object.prototype.toString.call(data).slice(8, -1) === 'Object'

// 根实例
class BambooVue {
  /**
   * Creates an instance of BambooVue.
   * @param {Object} options
   * @memberof BambooVue
   */
  constructor(options) {
    this.$options = options
    this.init()
  }

  /**
   * 初始化
   *
   * @memberof BambooVue
   */
  init() {
    if (!this.$options.el) { return }

    // 提升data属性访问层级到顶层
    this.$data = this.$options.data
    // 监听数据对象，实现数据响应化
    this.observe(this.$data)

    // 初始化编译
    new Compile(this.$options.el, this)

    // 生命周期钩子
    this.$options.created && this.$options.created.call(this)
  }

  /**
   * 挂载宿主元素
   *
   * @param {NodeElement} el
   * @memberof BambooVue
   */
  $mount(el) {
    if (!this.$options.el) {
      this.$options.el = el
      this.init();
    }
  }

  /**
   * 监听数据对象
   *
   * @param {Object} obj
   * @memberof BambooVue
   */
  observe(obj) {
    if (!isObject(obj)) { return }

    // 遍历数据对象
    Object.keys(obj).forEach((key) => {
      // 实现数据响应化
      this.defineReactive(obj, key, obj[key])
      // 代理data中的属性到BambooVue实例上，this.name 代理 this.$data.name
      this.proxyData(key)
    })
  }

  /**
   *数据响应化
   *
   * @param {Object} obj
   * @param {String} key
   * @param {Any} val
   * @memberof BambooVue
   */
  defineReactive(obj, key, val) {
    // 值为对象时，递归实现嵌套对象属性监听
    isObject(val) && this.observe(val)

    const dep = new Dep()

    // 给数据对象的每个key添加getter和setter
    Object.defineProperty(obj, key, {
      get() {
        Dep.target && dep.addDep(Dep.target)
        return val
      },
      set(newVal) {
        if (val === newVal) { return }

        val = newVal
        // console.log(`${key}:值更新了,${val}`)
        dep.notify()
      }
    })
  }

  /**
   * 代理data对象数据，实现在实例中直接访问data对象的属性
   *
   * @param {String} key
   * @memberof BambooVue
   */
  proxyData(key) {
    Object.defineProperty(this, key, {
      get() { return this.$data[key] },
      set(val) {
        if (val === this.$data[key]) { return }

        this.$data[key] = val
      }
    })
  }
}


// 依赖，用来管理Watcher
class Dep {
  constructor() {
    /**
     * 这里存储若干依赖（wather），与data的属性相关
     * <p>{{name1}}</p> <p>{{name2}}</p> <p>{{name1}}</p>
     * 上例有三个插值表达式，两个属性同名（name1），还有另一个属性（name2）
     * 每出现一个属性，就会添加一个watcher
    */
    this.deps = []
  }

  /**
   * 添加依赖（订阅），即添加watcher
   *
   * @param {Object} dep
   * @memberof Dep
   */
  addDep(dep) {
    this.deps.push(dep)
  }

  /**
   * 通知所有的dep去做更新，即watcher.update()
   *
   * @memberof Dep
   */
  notify() {
    this.deps.forEach((dep) => dep.update())
  }
}
// 初始化Dep的目标指向，会在Watcher中指向为watcher实例
Dep.target = null


// 监听器
class Watcher {
  /**
   * Creates an instance of Watcher.
   * @param {Object} vm BambooVue实例
   * @param {String} key
   * @param {Function} cb
   * @memberof Watcher
   */
  constructor(vm, key, cb) {
    this.vm = vm
    this.key = key
    this.cb = cb

    // 将watcher实例指定到Dep静态属性target上，进行组件间通信
    Dep.target = this
    // 触发相对应的getter，添加依赖
    this.vm[this.key]
    // 设置为null，避免再次添加依赖
    Dep.target = null
  }

  /**
   * 更新监听器中监听对象属性的值
   *
   * @memberof Watcher
   */
  update() {
    // console.log('属性更新了')
    this.cb.call(this.vm, this.vm[this.key])
  }
}