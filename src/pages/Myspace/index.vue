<template>
    <div style="height: 100%">
        <banner></banner>
        <el-tabs :tab-position="tabPosition" style="height: 100%" class="demo-tabs">
            <el-tab-pane label="个人信息">
                <div>
                    <personal-info></personal-info>
                </div>
            </el-tab-pane>
            <el-tab-pane label="我的项目">
                <div>
                    <my-project></my-project>
                </div>
            </el-tab-pane>
            <el-tab-pane label="我的团队">
                <my-team></my-team>
            </el-tab-pane>
            <el-tab-pane label="修改密码">
                <edit-secret></edit-secret>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script setup>
import Banner from '../Home/components/Banner.vue';
import { ref } from 'vue'
import PersonalInfo from './components/PersonalInfo.vue';
import MyProject from './components/MyProject.vue';
import MyTeam from './components/MyTeam.vue';
import EditSecret from './components/EditSecret.vue';

const tabPosition = ref('left')
</script>

<style>
.demo-tabs > .el-tabs__content {
  /* width: 30% !important; */
  padding: 32px;
  /* color: #6b778c;
  font-size: 32px;
  font-weight: 600; */
}
.el-tabs__header {
    width: 20% !important;
}
.el-tabs__nav {
    display: flex;
    justify-content: center;
    width: 100% !important;
}
.el-tabs__nav-wrap {
    width: 100% !important;
}
.el-tabs__item {
    display: flex !important;
    justify-content: center !important;
    width: 100% !important;
}

.el-tabs--right .el-tabs__content,
.el-tabs--left .el-tabs__content {
  height: 100%;
}
.el-tabs__nav is-left {
    width: 100%;
}
</style>
  