<template>
  <div>
    <label v-if="label">{{label}}</label>
    <slot></slot>
    <p v-if="error" class="error">{{error}}</p>
  </div>
</template>

<script>
  import Schema from "async-validator"

  export default {
    // 注入父（祖宗）组件传递的数据
    inject: ['form'],
    data() {
      return {
        error: ''
      }
    },
    props: {
      label: {
        type: String,
        default: ''
      },
      prop: {
        type: String
      },
    },
    created() {
      this.$on('validate', this.validate)
    },
    mounted () {
      // 如果此组件传入了 prop ，则需要通知父组件 以放入检测数组
      if (this.prop) {
        this.$parent.$emit("formItemAdd", this)
      }
    },
    methods: {
      validate() {
        return new Promise((resolve, reject) => {
          // 1、获取校验规则
          const rules = this.form.rules[this.prop]
          // 2、获取数据类型
          const value = this.form.model[this.prop]
          // 3、创建校验对象
          const discriptor = {[this.prop]: rules}
          // 4、创建校验器
          const schema = new Schema(discriptor)
          // 5、校验
          schema.validate({[this.prop]: value}, (errors) => {
            if (errors) {
              this.error = errors[0].message
              resolve(false)
            } else {
              this.error = ''
              resolve(true)
            }
          })
        })
      }
    }
  }
</script>

<style lang="css" scoped>
  .error {
    color: red
  }
</style>