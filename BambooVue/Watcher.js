import Dep from './Dep'

export default class Watcher {
  constructor() {
    // 将watcher实例指定到Dep静态属性target上，进行组件间通信
    Dep.target = this;
  }
  update() {
    console.log('属性更新了');
  }
}