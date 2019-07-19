<template>
  <div>
    <bamboo-form :model="model" :rules="rules" ref="bambooLoginForm">
      <bamboo-form-item label="用户名" prop="username">
        <bamboo-input v-model="model.username"></bamboo-input>
      </bamboo-form-item>
      <bamboo-form-item label="密码" prop="password">
        <bamboo-input type="password" v-model="model.password"></bamboo-input>
      </bamboo-form-item>
      <bamboo-form-item>
        <button @click="submitForm($event, 'bambooLoginForm')">signIn</button>
      </bamboo-form-item>
    </bamboo-form>

    <h3>Element表单</h3>
    <hr>
    <el-form :model="model" :rules="rules" ref="loginForm">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="model.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="model.password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm($event, 'loginForm')">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import BambooInput from '@/components/BambooInput.vue';
  import BambooFormItem from '@/components/BambooFormItem.vue';
  import BambooForm from '@/components/BambooForm.vue';

  export default {
    data () {
      return {
        model: {
          username: '',
          password: ''
        },
        rules: {
          username: [{required: true, message: '请输入用户名'}],
          password: [{required: true, message: '请输入密码'}]
        }
      }
    },
    components: {
      BambooInput,
      BambooFormItem,
      BambooForm,
    },
    methods: {
      submitForm(e, refForm) {
        e.preventDefault();

        this.$refs[refForm].validate((valid) => {
          if (valid) {
            alert('请求登录');
          } else {
            alert('校验失败');
          }
        })

      }
    }
  }
</script>

<style lang="scss" scoped>

</style>