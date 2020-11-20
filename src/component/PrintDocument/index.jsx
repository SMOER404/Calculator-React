import React from 'react';
import { jsPDF } from "jspdf";
import print_icon from "../../img/print.png"
import Button from "@material-ui/core/Button";
import {htmlpdf} from "./document";
import html2canvas from "html2canvas";

const PrintDocument = ({summ, period, rate}) => {

    const title = "Информация по вкладу";

    function doCanvas() {
        const div = document.createElement('div');

        div.innerHTML = htmlpdf;
        document.body.appendChild(div);

        const result = Math.floor(((period * rate) / 365000 + 1) * summ - summ);

        if(summ && period && rate) {
            document.querySelector('#summ').innerHTML = `${summ}`;
            document.querySelector('#period').innerHTML = `${period}`;
            document.querySelector('#rate').innerHTML = `${rate}`;
            document.querySelector('#result').innerHTML = `${result}`;
        }

        html2canvas(document.getElementById("pdfdocument"), {
            scrollY: 0,
            scrollX: 0
        }).then(canvas => {
            doPDF(canvas);
            div.remove();
        });
    }

    function doPDF(canvas) {
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF('p', 'mm');
        doc.addImage(imgData, 'PNG', 15, 15, 0, 0);
        doc.save(`${title}.pdf`);
    }


    return (
        <div className="mt-2">
            <Button onClick={doCanvas} variant="outlined">
                <span className="mr-1">Скачать PDF</span>
                <img src={print_icon} alt="Иконка принтера" />
            </Button>
        </div>
    );
};


export default PrintDocument;