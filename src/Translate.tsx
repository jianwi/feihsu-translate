import {useState} from "react";
import {bitable} from "@base-open/web-api";
import {Button, message, Collapse, Spin} from "antd";
import axios from "axios";
// import Setting from "./Setting";
import LanguageSelect from "./LanguageSelect.tsx";
import {useTranslation} from "react-i18next";


function TranslateResult({originText, translatedText, replaceText}: { originText: string, translatedText: string , replaceText: any }) {
    const {t} = useTranslation();

    let collapseItems = [
        {
            key: "1",
            label: t("originalText"),
            children: <p>{originText}</p>
        },
        {
            key: "2",
            label: t("translatedText"),
            children: <Spin spinning={!translatedText}>
                <p>{translatedText}</p>
                <Button size="small" style={{marginTop: "10px"}} type="primary" onClick={replaceText}>{t("replaceButton")}</Button>
            </Spin>
        }]

    return <Collapse style={{marginTop:"13px",padding:"0"}} bordered={false} items={collapseItems} defaultActiveKey={['1', '2']}/>
}

export default function Translate() {
    const {t} = useTranslation();

    const [originText, setOriginText] = useState("")
    const [translatedText, setTranslatedText] = useState("")
    const [tipText, setTipText] = useState(t("selectCellTip"))
    const [tableInfo, setTableInfo] = useState<any>({})

    function showTip() {
        setTipText(t('selectCellTip'))
        setOriginText("")
        setTranslatedText("")
    }


    // @ts-ignore
    window.off && window.off.constructor === Function && window.off()
    // @ts-ignore
    window.off = bitable.base.onSelectionChange(async (event) => {
        let data = event.data
        let {tableId, recordId, fieldId} = data
        if (!tableId || !recordId || !fieldId) {
            showTip()
            return
        }
        setTableInfo({
            tableId, recordId, fieldId
        })
        let table = await bitable.base.getTableById(tableId)
        let value = await table.getCellValue(fieldId, recordId)
        if (value && Array.isArray(value)) {
            let text = (value as { text: string }[]).map(item => item.text).join("")
            if (!text) {
                showTip()
                return
            }
            console.log("准备翻译", text)
            setTipText("")
            setOriginText(text)
            setTranslatedText("")

            try {
                let config = localStorage.getItem("settingConfig")
                if (config) {
                    config = JSON.parse(config)
                    // @ts-ignore
                    let {appId, secret} = config
                    if (!appId || !secret) {
                        message.error("百度翻译api配置错误，请检查")
                        return
                    }
                    getTranslateFromBaidu(text, appId, secret)
                    return
                } else {
                    getTranslate(text)
                }
            } catch (e) {
                message.error(JSON.stringify(e))
            }
        } else {
            showTip()
        }
    })

    async function replaceText() {
        if (!tableInfo.tableId || !tableInfo.recordId || !tableInfo.fieldId) {
            return;
        }
        let {tableId, recordId, fieldId} = tableInfo
        console.log(tableId, recordId, fieldId)
        let table = await bitable.base.getTableById(tableId)
        await table.setCellValue(fieldId, recordId, {
            text: translatedText,
            type: "text"
        } as any)
    }

    async function getTranslate(text: string) {
        const reqData = {
            q: text,
            from: "zh",
            to: "en"
        }
        if (/(\w{3}|^\w+$)/.test(text)) {
            reqData.from = "en"
            reqData.to = "zh"
        }
        let r = await axios.post("https://base-translator-api.replit.app/cell_translate", reqData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        let data = r.data
        if (data.trans_result && data.trans_result.length > 0) {
            setTranslatedText((data.trans_result as { dst: string }[]).map(item => item.dst).join(""))
        }
    }

    async function getTranslateFromBaidu(text: string, appId: string, secret: string) {
        const reqData = {
            q: text,
            from: "zh",
            to: "en",
            appid: appId,
            secret: secret
        }
        if (/([\w\s]{10}|^\w+$)/.test(text)) {
            reqData.from = "en"
            reqData.to = "zh"
        }
        let r = await axios.post("https://iwill.vip/t3.php", reqData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        let data = r.data
        if (data.trans_result && data.trans_result.length > 0) {
            setTranslatedText((data.trans_result as { dst: string }[]).map(item => item.dst).join(""))
        } else {
            message.error("翻译失败，请检查配置")
        }
    }

    return (
        <>
            <div style={{display: "flex", alignItems: "center", marginBottom: "20px", justifyContent: "center"}}>
                {t("toolTitle")}
            </div>
            <LanguageSelect/>
            {tipText ?
                <div style={{marginTop: '15px'}}>{tipText}</div> :
                <TranslateResult replaceText={replaceText} originText={originText} translatedText={translatedText}/>
            }
        </>
    )
}
