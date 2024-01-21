import random
import uuid
from datetime import date
from typing import Optional
from fastapi import FastAPI, HTTPException, Body, Query
from databases import Database
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta

from endpoints import app

#
# @app.get("/api/get_all_upcoming_payments")
# async def get_all_upcoming_payments():
#     query = f"""
#             SELECT * FROM {PAYMENT_TABLE_NAME}
#             WHERE PaymentRecAmount <= PaymentDueAmount
#         """
#     result = await database.fetch_all(query)
#
#     records = [Payment(**row).model_dump() for row in result]
#     return JSONResponse(content={"results": records}, status_code=200)
#
# @app.put("/api/update-payment")
# async def update_record(record: UpdatePayment, payment_id: str = Query(...)):
#     query = f"""
#     UPDATE {PAYMENT_TABLE_NAME}
#     SET PaymentRecDate = :PaymentRecDate,
#         PaymentRecAmount = :PaymentRecAmount
#     WHERE Paymentid = :payment_id
#     """
#
#     values = {
#         "PaymentRecDate": record.PaymentRecDate,
#         "PaymentRecAmount": record.PaymentRecAmount,
#         "payment_id": payment_id
#     }
#
#     try:
#         await database.execute(query, values)
#         return JSONResponse(content={"message": "Record updated successfully"}, status_code=200)
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))
#
#
# @app.put("/api/update-record")
# async def update_record(record: UpdateRecord, record_id: int = Query(...)):
#     query = f"""
#     UPDATE {CLIENT_RECORDS_TABLE_NAME}
#     SET LoanMaturity = :LoanMaturity,
#         LoanAmount = :LoanAmount,
#         ActiveStatus = :ActiveStatus
#     WHERE RecordId = :record_id
#     """
#
#     values = {
#         "record_id": record_id,
#         "LoanMaturity": record.LoanMaturity,
#         "LoanAmount": record.LoanAmount,
#         "ActiveStatus": record.ActiveStatus,
#     }
#
#     try:
#         await database.execute(query, values)
#         return JSONResponse(content={"message": "Record updated successfully"}, status_code=200)
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))
#





if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
