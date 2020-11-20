import React, {useEffect, useState} from "react";
import * as Yup from 'yup';
import {useFormik} from 'formik';
import './style.css';
import styles from './App.module.css';
import {data} from "./constants/data";
import moment from 'moment';
import {typeDeposit} from "./constants/type_deposit";
import FieldWrapper from "./component/CustomField";
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import PrintDocument from "./component/PrintDocument";

const App = () => {
    const [depositConditions, setDepositConditions] = useState(null);

    const [validateData, setValidateData] = useState({min_summ: null, min_period: null})
    const {min_summ, min_period} = validateData;

    const nowDate = moment(new Date());
    const minPeriodDate = nowDate.add('days', min_period);

    const validationSchema = Yup.object().shape({
        type_of_deposit: Yup.string()
            .required('Заполните тип вклада'),
        summ: Yup.number()
            .min(min_summ, `Минимальная сумма вклада ${min_summ} руб`).required('Заполните сумму'),
        term_of_deposit: Yup.date().min(minPeriodDate, 'Минимальный срок вклада 1 день').required('Заполните дату'),
    });

    const formData = useFormik({
        initialValues: {
            type_of_deposit: '',
            summ: '',
            term_of_deposit: ''
        },
        validationSchema: validationSchema,
        onSubmit: values => calcDepositConditions(values)
    });

    const {type_of_deposit} = formData.values;
    const depositData = type_of_deposit ? data[parseInt(type_of_deposit) - 1] : null;

    const calcMinPeriodAndSumm = () => {
        if (depositData) {
            const minPeriod = depositData?.param[0].period_from;
            const minSumm = depositData?.param[0].summs_and_rate[0].summ_from;

            if (!!minPeriod && !!minSumm) {
                setValidateData({...validateData, min_summ: minSumm, min_period: minPeriod})
            }
        }
    }

    useEffect(() => {
        calcMinPeriodAndSumm()
    }, [depositData])

    const calcDepositConditions = ({type_of_deposit, summ, term_of_deposit}) => {
        const now = moment(new Date());
        const termOfDeposit = moment(term_of_deposit);
        const duration = moment.duration(termOfDeposit.diff(now));
        const days = Math.floor(duration.asDays());
        const typeDeposit = data[type_of_deposit - 1];
        const periodArray = [];
        const rateArray = [];

        if (!!typeDeposit) {
            typeDeposit.param.map(item => (item.period_from <= days) && periodArray.push(item))
        }

        const period = periodArray.pop();

        if (!!period) {
            period?.summs_and_rate.map(item => (item.summ_from <= summ) && rateArray.push(item))
        }

        const summAndRate = rateArray.pop();

        if (!!period && !!summAndRate) {
            setDepositConditions({
                ...depositConditions,
                period_conditions: period.period_from,
                rate_conditions: summAndRate.rate,
                summ: summ,
                period: days
            })
        }
    }

    const {rate_conditions, summ, period} = depositConditions ? depositConditions : {
        period_conditions: null,
        rate: null,
        summ: null,
        period: null
    };


    return (

        <Container maxWidth="md">
            <div className={styles.wrapper}>
                <h2 className="mb-1">Депозитный калькулятор</h2>
                <form onSubmit={formData.handleSubmit}>
                    <div className={styles.field_wrapper}>
                        <FieldWrapper errors={formData.errors.type_of_deposit}
                                      touched={formData.touched.type_of_deposit}>
                            <InputLabel id="type_of_deposit">Тип вклада</InputLabel>
                            <Select
                                name="type_of_deposit"
                                id="type_of_deposit"
                                onChange={formData.handleChange}
                                onBlur={formData.handleBlur}
                            >
                                {typeDeposit &&
                                typeDeposit.map((item, index) =>
                                    <MenuItem value={parseInt(item.value)} key={index}>{item.label}</MenuItem>
                                )}
                            </Select>
                        </FieldWrapper>
                        <FieldWrapper errors={formData.errors.summ} touched={formData.touched.summ}>
                            <TextField
                                type="number"
                                name="summ"
                                placeholder="1 000 000"
                                label="Сумма"
                                onChange={formData.handleChange}
                                onBlur={formData.handleBlur}
                                disabled={!formData.values.type_of_deposit}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </FieldWrapper>
                        <FieldWrapper errors={formData.errors.term_of_deposit}
                                      touched={formData.touched.term_of_deposit}>
                            <TextField
                                type="date"
                                name="term_of_deposit"
                                id="term_of_deposit"
                                label="Срок вклада"
                                onChange={formData.handleChange}
                                onBlur={formData.handleBlur}
                                disabled={!formData.values.type_of_deposit}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </FieldWrapper>
                        <Button
                            variant="outlined"
                            color="primary"
                            type="submit"
                            disabled={Object.entries(formData.errors).length !== 0 || !formData.values.type_of_deposit}
                        >
                            Рассчитать
                        </Button>
                    </div>
                </form>
                {(formData.isSubmitting && depositConditions) &&
                <div className={styles.result_list}>
                    <h4>Информация по вкладу: </h4>
                    <p>Сумма вклада: {summ} руб.</p>
                    <p>Срок вклада: {period} дней.</p>
                    <p>Процент по вкладу: {rate_conditions}%.</p>
                    <p>Доход от вклада: {Math.floor(((period * rate_conditions) / 365000 + 1) * summ - summ)} руб.</p>
                    <PrintDocument
                        summ={summ}
                        period={period}
                        rate={rate_conditions}
                        result={Math.floor(((period * rate_conditions) / 365000 + 1) * summ - summ)}
                    />
                </div>
                }
            </div>
        </Container>
    );
}

export default App;
