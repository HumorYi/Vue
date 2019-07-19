<template>
  <form :model="model" :rules="rules">
    <slot></slot>
  </form>
</template>

<script>
  export default {
    provide() {
      return {
        // 将表单实例传递给后代
        form: this
      }
    },
    data() {
      return {
        formItems: []
      }
    },
    props: {
      model: {
        type: Object,
        required: true
      },
      rules: {
        type: Object
      }
    },
    created () {
      // 缓存需要校验的表单项
      this.$on('formItemAdd', (formItem) => this.formItems.push(formItem))
    },

    methods: {
      async validate(callback) {
        // 将FormItem数组转换为 validate() 返回的promise数组
        // 调用 FormItem 组件的 validate 方法可以得到表单数据校验的结果
        let tasks = this.formItems.map((formItem) => formItem.validate())

        // 获取所有结果统一处理
        const results = await Promise.all(tasks)
        let ret = true

        for (let i = results.length - 1; i >= 0; i--) {
          if(!results[i]) {
            ret = false
            break
          }
        }
        callback(ret)
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>