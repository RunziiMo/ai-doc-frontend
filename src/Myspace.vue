<script setup>
    function test() {
        this.$router.push('/')
    }
</script>

<template>
    <div @click="test">我的页面</div>
</template>
