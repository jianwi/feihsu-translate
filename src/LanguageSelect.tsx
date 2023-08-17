import {useEffect, useState} from "react";
import { useTranslation } from "react-i18next";
import {Radio, Space, Select, Button} from "antd";

const supportedLanguage = [
    { code: "zh-TW", key: "lang.zh-TW" },
    { code: "zh", key: "lang.zh" },
    { code: "en", key: "lang.en" },
    { code: "ja", key: "lang.ja" },
    { code: "ru", key: "lang.ru" },
    { code: "de", key: "lang.de" },
    { code: "it", key: "lang.it" },
    { code: "pl", key: "lang.pl" },
    { code: "th", key: "lang.th" },
    { code: "hi", key: "lang.hi" },
    { code: "id", key: "lang.id" },
    { code: "es", key: "lang.es" },
    { code: "pt", key: "lang.pt" },
    { code: "ko", key: "lang.ko" },
    { code: "vi", key: "lang.vi" },
    { code: "ms", key: "lang.ms" },
    { code: "tl", key: "lang.tl" },
];

export default function LanguageSelect({translateFn}: {translateFn: any}) {
    const { t } = useTranslation();
    const [mode, setMode] = useState("auto")
    const [fromLanguage, setFromLanguage] = useState("en")
    const [toLanguage, setToLanguage] = useState("zh")

    let defaultTranslateConfig = {
        mode: "auto",
        from: "en",
        to: "zh",
        direction: 1
    }

    useEffect(() => {
        let translateConfigJSON = localStorage.getItem("translateConfig")
        if (translateConfigJSON) {
            let translateConfig = JSON.parse(translateConfigJSON)
            setMode(translateConfig.mode)
            setFromLanguage(translateConfig.from)
            setToLanguage(translateConfig.to)
        }
    }, [])


    function handleChangeMode(e:any) {
        let translateConfigJSON = localStorage.getItem("translateConfig")
        if (!translateConfigJSON) {
            translateConfigJSON = JSON.stringify(defaultTranslateConfig)
        }
        let translateConfig = JSON.parse(translateConfigJSON)
        console.log(e.target.value)
        setMode(e.target.value)
        translateConfig.mode = e.target.value
        localStorage.setItem("translateConfig", JSON.stringify(translateConfig))
    }
    
    function handleChangeFrom(value: string) {
        let translateConfigJSON = localStorage.getItem("translateConfig")
        if (!translateConfigJSON) {
            translateConfigJSON = JSON.stringify(defaultTranslateConfig)
        }
        let translateConfig = JSON.parse(translateConfigJSON)
        setFromLanguage(value)
        translateConfig.from = value
        localStorage.setItem("translateConfig", JSON.stringify(translateConfig))
    }
    
    function handleChangeTo(value: string) {
        let translateConfigJSON = localStorage.getItem("translateConfig")
        if (!translateConfigJSON) {
            translateConfigJSON = JSON.stringify(defaultTranslateConfig)
        }
        let translateConfig = JSON.parse(translateConfigJSON)
        setToLanguage(value)
        translateConfig.to = value
        localStorage.setItem("translateConfig", JSON.stringify(translateConfig))
        translateFn()
    }

    const [currentDirection, setCurrentDirection] = useState(1)

    function handleSwitch() {
        let targetDirection = currentDirection * -1
        setCurrentDirection(currentDirection * -1)
        let translateConfigJSON = localStorage.getItem("translateConfig")
        if (!translateConfigJSON) {
            translateConfigJSON = JSON.stringify(defaultTranslateConfig)
        }
        let translateConfig = JSON.parse(translateConfigJSON)
        translateConfig.direction = targetDirection
        localStorage.setItem("translateConfig", JSON.stringify(translateConfig))
        translateFn()
    }


    return <>
        <Radio.Group size="small" onChange={handleChangeMode} value={mode} buttonStyle="solid" style={{textAlign:'left'}}>
            <Space size="small" direction="vertical">
                <Radio value="auto">
                    {t("select.mode.auto")}
                </Radio>
                <Radio value="custom">
                    {t("select.mode.custom")}
                </Radio>
            </Space>
        </Radio.Group>
        {
            mode === "custom"?
            <div style={{marginTop: "10px"}}>
                <Select
                    size="small"
                    onChange={handleChangeFrom}
                    style={{ width: 100 }}
                    options={supportedLanguage.map((item) => ({
                        label: t(item.key),
                        value: item.code,
                    }))}
                    defaultValue={fromLanguage}
                />
                <Button
                    size="small"
                    type="link" onClick={handleSwitch} style={{margin: "0 10px"}}>{ currentDirection == 1?'\u2192':'\u2190' }</Button>
                <Select
                    size="small"
                    onChange={handleChangeTo}
                    style={{ width: 100 }}
                    options={supportedLanguage.map((item) => ({
                        label: t(item.key),
                        value: item.code,
                    }))}
                    defaultValue={toLanguage}
                />
            </div>:null
        }

    </>
}