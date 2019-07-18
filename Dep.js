// 用来管理Watcher
export default class Dep {
  constructor() {
    /**
     * 这里存储若干依赖（wather），与data的属性相关
     * <p>{{name1}}</p> <p>{{name2}}</p> <p>{{name1}}</p>
     * 上例有三个插值表达式，两个属性同名（name1），还有另一个属性（name2）
     * 实际上添加了两个watcher
    */
    this.deps = []
  }
  /**
   * 添加依赖，即添加watcher
   *
   * @param {Watcher} dep
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