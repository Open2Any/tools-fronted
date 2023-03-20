<script setup lang='ts'>
import { ref,watch} from 'vue'
import {  NModal, NForm, NFormItem, NInput,FormInst,NSpace,NButton,useMessage  } from 'naive-ui';
import { fetchLogin, fetchResetPassword, fetchRegister,fetchSendCode } from '@/api'
import { t } from '@/locales'

const rules = ref({
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
     password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
      
    });


const formTitle = ref('登录');
const type = ref('login'); // 默认显示登录表单
const form = ref({
  username: '',
  password: '',
  email: '',
  code:''
});

const formRef = ref<FormInst | null>(null)

const showForm = ref(false);

const handleSubmit = (e:any) => {
   e.preventDefault()
    // 处理表单提交逻辑
    // 根据type的值判断是登录表单还是重置密码表单
    console.log('formRef: ', formRef);
    formRef.value?.validate(async (errors) => {
      if (!errors) {
        if (type.value == 'login') {
          login(form)
        } else if(type.value == 'reset') {
          resetPassword(form)
        } else {
           register(form)
        }
      } else {
        console.log(errors)
      }
    })
};

interface Emit {
  (ev: 'changeTypeLabel',label:string): void
}

const emit = defineEmits<Emit>()


const changeTypeLabel = (label:string) => {
  emit('changeTypeLabel',label)
}

const changeType = (buttonType: string) => {
  formTitle.value = buttonType =='register'?'注册':buttonType =='reset'?'修改密码':'登录'
  type.value =buttonType
}

watch(
  () => showForm.value,
  (val) => {
    console.log('val: ', val);
    if (val == false)
      changeType('login')
  },
  { immediate: true },
)



const showLoginForm = () => {
  showForm.value = true
}

const ms = useMessage()

const login = async (form: any) => {
  try{
      const res:any =await fetchLogin(form.value.username, form.value.password)
      const token: string = res.data.token
      localStorage.setItem('token', token)
       ms.success(t('login success'))
      changeTypeLabel('退出登录')
    showForm.value = false
  }catch(err:any) {
    console.log('err: ', err.message);
    ms.error(t(err.message))
     
  }
}

const register = async (form: any) => {
  try{
      const res:any =await fetchRegister(form.value.username, form.value.password,form.value.email)
      ms.success(t(res.message))
       showForm.value = false
  }catch(err:any) {
    ms.error(t(err.message))
  }
}

const sendCode = async () => {
  console.log('form: ', form.value);
  try{
      await fetchSendCode(form.value.email)
      ms.success(t(`邮件发送成功`))
  }catch(err:any) {
    ms.error(t(err.message))
  }
}

const resetPassword = async (form: any) => {
  try{
      await fetchResetPassword(form.value.email, form.value.password, form.value.code)
      localStorage.removeItem('token')
      ms.success(t(`密码修改成功,请重新登录`))
      type.value = 'login'
      showForm.value = false
  }catch(err:any) {
    ms.error(t(err.message))
  }
}


const onNegativeClick = () => {
  form.value = {
    username: '',
    password: '',
    email: '',
    code:''
  }
  showForm.value = false
}


defineExpose({
  showLoginForm,
  changeType,
  type:type.value
});
</script>

<template>
    <n-modal
    v-model:show="showForm" 
    :title="formTitle" 
    preset="dialog"
    :bordered="false"
    @close-on-esc="onNegativeClick"
    @on-after-leave=""
    :mask-closable="false"
    class="relative"
    style="padding-bottom: 4rem;"
    >
      <n-form 
        autocomplete="off"
        ref="formRef"
        :label-width="80"
        :model="form"
        :rules="rules"
        
       >
        <n-form-item label="用户名" path="username" v-if="type != 'reset'">
          <n-input v-model:value="form.username" placeholder="请输入用户名"  autocomplete="off"></n-input>
        </n-form-item>
        <n-form-item label="邮箱" path="email" v-if="type != 'login'">
          <n-input v-model:value="form.email" placeholder="请输入邮箱" autocomplete="off"></n-input>
        </n-form-item>
        <n-form-item :label="type=='reset'?'设置新密码':'密码'" path="password">
          <n-input type="password" v-model:value="form.password" placeholder="请输入密码" autocomplete="off"></n-input>
        </n-form-item>
        <n-form-item label="验证码" path="code"  v-if="type == 'reset'">
          <n-input  v-model:value="form.code" placeholder="请输入验证码" autocomplete="off"></n-input>
          <n-button type="primary" ghost @click="sendCode">
            发送验证码
          </n-button>
        </n-form-item>


      </n-form>
       <n-space justify="space-between">
      <n-button v-if="type !=='reset'&&type !=='register'" @click="changeType('register')" quaternary type="info">注册</n-button>
      <n-button  v-if="type !=='reset'&&type !=='login'" @click="changeType('login')" quaternary type="info">登录</n-button>

       <n-button v-if="type !=='reset'" @click="changeType('reset')" quaternary type="info">忘记密码</n-button>
      <!-- <n-button  v-if="type=='reset'" @click="changeType('reset')">重置密码</n-button> -->
      </n-space>
      <div class="modal-footer absolute  right-0" 
      style="bottom: -3rem;">
       <n-space>
        <n-button tertiary   @click="onNegativeClick">取消</n-button>
        <n-button @click="handleSubmit" tertiary type="success">{{ formTitle }}</n-button>
       </n-space>
      </div>
    </n-modal>
</template>
