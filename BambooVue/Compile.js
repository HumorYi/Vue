class Compile {
  /**
   * Creates an instance of Compile.
   * @param {NodeElement} el
   * @param {Object} vm BambooVue实例
   * @memberof Compile
   */
  constructor(el, vm) {
    // 要遍历的宿主元素
    this.$el = this.isElement(el) ? el : document.querySelector(el)
    // 保存BambooVue实例
    this.$vm = vm

    if (this.$el) {
      // 转换宿主元素内容为文档片段
      this.$fragment = this.node2Fragment(this.$el)
      // 对文档片段进行编译
      this.compile(this.$fragment)
      // 将编译完的html结果追加至宿主元素
      this.$el.appendChild(this.$fragment)
    }
  }

  /**
   * 转换宿主元素内容为文档片段，提升性能
   *
   * @param {NodeElement} el
   * @returns {fragment}
   * @memberof Compile
   */
  node2Fragment(el) {
    const fragment = document.createDocumentFragment()
    // 将el中所有子元素搬家至fragment中
    let child

    while (child = el.firstChild) {
      fragment.appendChild(child)
    }

    return fragment
  }

  /**
   * 编译宿主元素的所有子节点
   *
   * @param {NodeElement} el
   * @memberof Compile
   */
  compile(el) {
    Array.from(el.childNodes).forEach((node) => {
      // 对所有节点进行类型判断
      if (this.isElement(node)) {
        // console.log('编译元素' + node.nodeName)
        // 查找节点属性以特殊字符 b- b-on: @ b-bind: :开头的属性
        Array.from(node.attributes).forEach((attr) => {
          const attrName = attr.name
          const expression = attr.value

          if (this.isDirective(attrName)) {
            // b-text => text
            const directive = attrName.substring(2)
            this[directive] && this[directive](node, this.$vm, expression)
          }

          if (this.isEvent(attrName)) {
            // @click | b-on:click
            const directive = attrName.substring(attrName.startsWith('@') ? 1 : 5);
            this.eventHandler(node, this.$vm, expression, directive)
          }

          if (this.isBind(attrName)) {
            // :name | b-bind:name
            const directive = attrName.substring(attrName.startsWith(':') ? 1 : 7);
            this.bindHandler(node, this.$vm, expression, directive)
          }
        })
      }
      else if (this.isInterpolation(node)) {
        // console.log('编译插值文本' + node.textContent)
        this.compileInterpolation(node)
      }

      // 递归子节点
      node.childNodes && node.childNodes.length > 0 && this.compile(node)
    })
  }
  /**
   * 编译插值文本
   *
   * @param {NodeElement} node
   * @memberof Compile
   */
  compileInterpolation(node) {
    // console.log(RegExp.$1) => {{name}} => name
    // 如果有多个正则会比较危险，不确定何时取到插值文本中的表达式 name
    // this.update(node, this.$vm, RegExp.$1, 'text')
    this.update(node, this.$vm, node.textContent.match(/\{\{\s*(.+?)\s*\}\}/)[1], 'text')
  }

  /**
   * 更新（发布）处理
   *
   * @param {NodeElement} node
   * @param {Object} vm BambooVue实例
   * @param {String} expression
   * @param {String} directive
   * @memberof Compile
   */
  update(node, vm, expression, directive) {
    const updaterFn = this[directive + 'Updater']
    // 初始化更新
    updaterFn && updaterFn(node, vm[expression])
    // 依赖收集
    new Watcher(vm, expression, function (val) {
      updaterFn && updaterFn(node, val)
    })
  }

  /**
   * text处理
   *
   * @param {NodeElement} node
   * @param {Object} vm BambooVue实例
   * @param {String} expression
   * @memberof Compile
   */
  text(node, vm, expression) {
    this.update(node, vm, expression, 'text')
  }
  /**
   * text更新
   *
   * @param {NodeElement} node
   * @param {Any} val
   * @memberof Compile
   */
  textUpdater(node, val) {
    node.textContent = val
  }

  /**
   * html处理
   *
   * @param {NodeElement} node
   * @param {Object} vm BambooVue实例
   * @param {String} expression
   * @memberof Compile
   */
  html(node, vm, expression) {
    this.update(node, vm, expression, 'html')
  }
  /**
   * html更新
   *
   * @param {NodeElement} node
   * @param {Any} val
   * @memberof Compile
   */
  htmlUpdater(node, val) {
    node.innerHTML = val;
  }

  /**
   * model处理，双向绑定
   *
   * @param {NodeElement} node
   * @param {Object} vm BambooVue实例
   * @param {String} expression
   * @memberof Compile
   */
  model(node, vm, expression) {
    // 指定input的value属性，模型 => 视图
    this.update(node, vm, expression, 'model')

    // 视图 => 模型
    node.addEventListener('input', (e) => {
      // 值一改变就会触发setter，界面中所有跟这个值相关的地方都会变 => dep.notify()
      vm[expression] = e.target.value
    })
  }
  /**
   * 事件更新
   *
   * @param {NodeElement} node
   * @param {Any} val
   * @memberof Compile
   */
  modelUpdater(node, val) {
    node.value = val
  }

  /**
   * 事件处理
   *
   * @param {NodeElement} node
   * @param {Object} vm BambooVue实例
   * @param {String} expression
   * @param {String} directive
   * @memberof Compile
   */
  eventHandler(node, vm, expression, directive) {
    // @click="clickHandle" => directive: click , expression: clickHandle
    let fn = vm.$options.methods && vm.$options.methods[expression]
    if (directive && fn) {
      node.addEventListener(directive, fn.bind(vm))
    }
  }

  /**
   * 绑值处理
   *
   * @param {NodeElement} node
   * @param {Object} vm BambooVue实例
   * @param {String} expression
   * @param {String} directive
   * @memberof Compile
   */
  bindHandler(node, vm, expression, directive) {
    console.log('bind');
  }

  /**
   * 是否dom元素
   *
   * @param {NodeElement} node
   * @returns {Boolean}
   * @memberof Compile
   */
  isElement(node) {
    return node.nodeType === 1
  }

  /**
   * 是否插值文本
   *
   * @param {NodeElement} node
   * @returns {Boolean}
   * @memberof Compile
   */
  isInterpolation(node) {
    return node.nodeType === 3 && /\{\{\s*(.+?)\s*\}\}/.test(node.textContent)
  }

  /**
   * 是否指令
   *
   * @param {String} attr
   * @returns {Boolean}
   * @memberof Compile
   */
  isDirective(attr) {
    return attr.startsWith('b-')
  }

  /**
   * 是否事件
   *
   * @param {String} attr
   * @returns {Boolean}
   * @memberof Compile
   */
  isEvent(attr) {
    return attr.startsWith('@') || attr.startsWith('b-on:')
  }

  /**
   * 是否绑值指令
   *
   * @param {String} attr
   * @returns {Boolean}
   * @memberof Compile
   */
  isBind(attr) {
    return attr.startsWith(':') || attr.startsWith('b-bind:')
  }
}