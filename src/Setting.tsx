import { Modal, Button, Input , message} from 'antd';
import { useState } from 'react';


export default function Setting(){
    let settingConfig = {
        appId: '',
        secret: ''
    }

    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState(settingConfig);

    const showModal = () => {
        let settingConfigStr = localStorage.getItem('settingConfig');
        try {
            if (settingConfigStr) {
                let settingConfigJSON = JSON.parse(settingConfigStr);
                settingConfig = {
                    appId: settingConfigJSON.appId,
                    secret: settingConfigJSON.secret
                }
            }else {
                settingConfig = {
                    appId: '',
                    secret: ''
                }
            }
        }catch (e) {
            settingConfig = {
                appId: '',
                secret: ''
            }
        }
        setVisible(true);
        setConfig(settingConfig);
    };


    const handleOk = () => {
        localStorage.setItem('settingConfig', JSON.stringify(config));
        message.success('保存成功');
        setVisible(false);
    };
    const handleCancel = () => {
        setVisible(false);
    };
    return (
        <>
        <Button type='primary' className='setting-btn' onClick={showModal}>
            <img width="22px" height="22px" src="/images/setting.png" alt=""/>
        </Button>
        <Modal
            title="设置百度翻译"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
        >
          <div>
              <div className='desc'>默认的api随时可能失效，请填写
                  <a target="_blank" href="http://api.fanyi.baidu.com/manage/developer">百度翻译</a>的key
              </div>
              <div style={{padding:"30px 20px"}}>
                  <Input addonBefore={<span>APP ID</span>} placeholder='请输入百度翻译的APP ID' value={config.appId}
                         onChange={(e) => {
                             console.log(e.target.value)
                             console.log(config)
                             setConfig({
                                 ...config,
                                 appId: e.target.value
                             })
                         }}/>
                  <div style={{height: 6}}></div>
                  <Input addonBefore={<span>密钥</span>} placeholder='请输入百度翻译的密钥' value={config.secret}
                         onChange={(e) => {
                             setConfig({
                                    ...config,
                                    secret: e.target.value
                             })
                         }
                         }/>
              </div>
          </div>
        </Modal>
        </>
    );
}