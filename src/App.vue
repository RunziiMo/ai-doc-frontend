<template>
    <router-view></router-view>
</template>

<script>
export default {
    name: 'App'
}
</script>

<style>
/* 全局样式，确保 html 和 body 的高度为 100% */
html,
body {
    margin: 0;
    padding: 0;
    height: calc(100vh);
}

#app {
    height: 100%;
    display: flex;
    flex-direction: column;
}

#app > .el-container:first-child {
    height: 100%;
}

.el-container > .el-container:first-of-type {
  height: calc(100vh - 60px);
}

</style>