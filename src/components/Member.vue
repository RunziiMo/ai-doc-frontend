<template>
    <el-dialog v-model="props.dialogVisible" :show-close="false">
        <template #header="{ close, titleId, titleClass }">
            <div class="my-header">
                <h4 :id="titleId" :class="titleClass">项目成员</h4>
                <el-button type="success" @click="addMember">
                    <el-icon><Stamp /></el-icon>
                    添加成员
                </el-button>
            </div>
        </template>
        <div class="member-list">
            <div v-for="member, index in memberList" key="index" class="member-item">
                <el-input
                    style="width: 200px;"
                    v-if="index === memberList.length - 1 && member.memberName === ''"  
                    v-model="member.memberName"  
                    placeholder="请输入成员姓名"  
                ></el-input>  
                <span v-else>{{ member.memberName }}</span>
                <div class="member-item-oprate">
                    <el-select
                        v-model="member.memberRole"
                        placeholder=""
                        style="width: 80px"
                    >
                        <el-option
                            v-for="item in memberRoleList"
                            :key="item.memberRole"
                            :label="item.label"
                            :value="item.memberRole"
                        />
                    </el-select>
                    <el-button @click="() => deleteMember(index)" type="danger" :disabled="memberList.length === 1">
                        移除
                    </el-button>
                    <text>创建者</text>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="confirmEditMemberHandle">确定</el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script setup>
import { reactive, ref } from 'vue';
const props = defineProps(['dialogVisible', 'handleClose']);

const memberList = reactive([
    {
        memberName: '测试1',
        // 0 代表成员，1代表管理员，2代表创建者
        memberRole: 0,
    },
    {
        memberName: '测试2',
        memberRole: 1,
    }
]);

const memberRoleList = reactive([
    {
        label: '成员',
        memberRole: 0,
    },
    {
        label: '管理员',
        memberRole: 1,
    },
    {
        label: '创建者',
        memberRole: 2,
    }
]);
const deleteMember = (index) => {
    console.log('删除成员索引', index);
    memberList.splice(index, 1);
}
const confirmEditMemberHandle = () => {
    console.log('提交的成员列表', memberList);
    props.handleClose();
}

const addMember = () => {  
  // 添加新成员，并为新成员设置一个唯一的 ID（如果还没有的话）  
  memberList.push({  
    id: memberList.length + 1, // 假设我们使用长度+1作为唯一ID  
    memberName: '', // 初始为空字符串，用户需要输入  
    memberRole: 0, // 假设0是默认角色  
  });
};  
</script>

<style>
.my-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid #ccc;
}
.member-item:last-child {
    border-bottom: 1px solid #ccc;
}
.member-item-oprate {
    display: flex;
    gap: 10px;
    align-items: center;
}
</style>