<template>
  <div id="app">
    <h1>Vue组件设计与实践</h1>
    <form-test/>
  </div>
</template>

<script>
import FormTest from "@/components/FormTest.vue";

export default {
  name: 'app',
  components: {
    FormTest,
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
