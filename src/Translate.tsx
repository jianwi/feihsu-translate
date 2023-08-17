import {useState} from "react";
import {bitable} from "@base-open/web-api";
import {Button, Collapse, Spin} from "antd";
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

            getTranslate(text)
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

    function getReqData(text: string) {
        let reqData = {
            q: text,
            from: "zh",
            to: "en"
        }
        let configJSON = localStorage.getItem("translateConfig")
        if (configJSON) {
            let config = JSON.parse(configJSON)
            if (config.mode === "custom") {
                reqData.from = config.from
                reqData.to = config.to
                if (config.direction != 1) {
                    reqData.from = config.to
                    reqData.to = config.from
                }
                return reqData
            }
        }
        if (/(\w{3}|^\w+$)/.test(text)) {
            reqData.from = "en"
            reqData.to = "zh"
        }
        return reqData
    }
    async function getTranslate(text: string) {
        let reqData = getReqData(text)
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

    return (
        <>
            <div style={{display: "flex", alignItems: "center", marginBottom: "10px", justifyContent: "center"}}>
                {t("toolTitle")}
            </div>
            <LanguageSelect translateFn={()=>{
                getTranslate(originText)
            }} />
            {tipText ?
                <div style={{marginTop: '15px'}}>{tipText}</div> :
                <TranslateResult replaceText={replaceText} originText={originText} translatedText={translatedText}/>
            }
        </>
    )
}
