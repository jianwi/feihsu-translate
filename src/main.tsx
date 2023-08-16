import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import { initI18n } from './i18n'
import { bitable } from '@base-open/web-api'
import { useTranslation } from 'react-i18next';
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <LoadApp />
  </React.StrictMode>,
  document.getElementById('root'),
)

function LoadApp() {

    const [load, setLoad] = useState(false);
    const [loadErr, setLoadErr] = useState<any>(null)
    useEffect(() => {
        const timer = setTimeout(() => {
            initI18n('en');
            setTimeout(()=>{
                setLoadErr(<LoadErr/>)

            },1000)
        }, 5000)
        bitable.bridge.getLanguage().then((lang) => {
            clearTimeout(timer)
            initI18n(lang as any);
            setLoad(true);
        });
        return () => clearTimeout(timer)
    }, [])

    if (load) {
        return <App />
    }

    return loadErr
}

function LoadErr() {
    const {t} = useTranslation();
    return <div>
        {t('load_error.1')}
        <a target='_blank' href='https://bytedance.feishu.cn/docx/HazFdSHH9ofRGKx8424cwzLlnZc'>{t('load.guide')}</a>
    </div>

}
