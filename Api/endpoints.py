import decimal
import json
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta
import random
import uuid
from decimal import Decimal

from databases import Database
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from models import NewLoan, NewPayment, Client, Loan, Payment, UpdateLoan

DATABASE_NAME = "TestDB"
CLIENT_TABLE_NAME = "Client"
CLIENT_RECORDS_TABLE_NAME = "LoanRecord"
PAYMENT_TABLE_NAME = "PaymentRecord"
DATABASE_URL = "mysql://admin:admin1234@testdb.c7jfeg3symat.us-east-2.rds.amazonaws.com:3306/" + DATABASE_NAME
database = Database(DATABASE_URL)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/clients")
async def get_all_clients():
    query = f"SELECT * FROM {CLIENT_TABLE_NAME}"
    result = await database.fetch_all(query)
    records = [Client(**row).model_dump() for row in result]
    return JSONResponse(content={"results": records}, status_code=200)

@app.post("/api/new-loan")
async def create_new_loan(loan: NewLoan):
    # Generate a random 6-digit RecordId
    record_id = random.randint(100000, 999999)
    record_id = "LX-"+str(record_id)
    find_client_query = f"""
    SELECT ClientId FROM {CLIENT_TABLE_NAME}
    WHERE ClientName = :ClientName
    """
    client = await database.fetch_one(find_client_query, {"ClientName": loan.ClientName})
    print(client)

    # If client not found, create a new client
    if not client:
        new_client_id = str(uuid.uuid4())
        create_client_query = f"""
        INSERT INTO {CLIENT_TABLE_NAME} (ClientId, ClientName)
        VALUES (:ClientId, :ClientName)
        """
        await database.execute(create_client_query,
                               {"ClientId": new_client_id, "ClientName": loan.ClientName})
        client_id = new_client_id
    else:
        client_id = client["ClientId"]

    # Insert the new record
    insert_query = f"""
    INSERT INTO {CLIENT_RECORDS_TABLE_NAME} (LoanId, ClientId, LoanAmount, ActiveStatus, LoanMaturity, ClientName, PaymentFrequency, InterestRate, IssueDate)
    VALUES (:record_id, :client_id, :loan_amount, :active_status, :loan_maturity, :name, :payment_frequency, :interest_rate, :issue_date)
    """
    await database.execute(insert_query, {
        "record_id": record_id,
        "client_id": client_id,
        "loan_amount": loan.LoanAmount,
        "active_status": loan.ActiveStatus,
        "loan_maturity": loan.LoanMaturity,
        "name": loan.ClientName,
        "payment_frequency": loan.PaymentFrequency,
        "interest_rate": loan.InterestRate,
        "issue_date": loan.IssueDate
    })

    issue_date = loan.IssueDate
    loan_maturity = loan.LoanMaturity

    total_days = (loan_maturity - issue_date).days

    if loan.PaymentFrequency == "Monthly":
        new_due_date = loan.IssueDate + timedelta(days=30)
        new_due_date = min(new_due_date, loan_maturity)
        amtpayments = total_days // 30

    elif loan.PaymentFrequency == "Quarterly":
        new_due_date = loan.IssueDate + timedelta(days=90)
        new_due_date = min(new_due_date, loan_maturity)
        amtpayments = total_days // 90

    elif loan.PaymentFrequency == "Annually":
        new_due_date = loan.IssueDate + relativedelta(years=1)
        new_due_date = min(new_due_date, loan_maturity)
        amtpayments = total_days // 365

    new_payment = NewPayment(
        LoanId=record_id,
        PaymentDueDate=new_due_date,
        PaymentDueAmount=(loan.LoanAmount * (loan.InterestRate * .01)) / amtpayments
    )
    await create_new_payment(new_payment)
    return JSONResponse(content={"message": "New record created successfully", "LoanId": record_id}, status_code=200)

@app.post("/api/new-payment")
async def create_new_payment(payment: NewPayment):
    payment_id = str(uuid.uuid4())
    query = f"""
    INSERT INTO {PAYMENT_TABLE_NAME}
    (LoanId, PaymentDueDate, PaymentDueAmount, PaymentRecDate, PaymentRecAmount, PaymentId, PaidStatus)
    VALUES (:record_id, :payment_due_date, :payment_due_amount, :payment_rec_date, :payment_rec_amount, :payment_id, :paid_status)
    """
    values = {
        "record_id": payment.LoanId,
        "payment_due_date": payment.PaymentDueDate,
        "payment_due_amount": payment.PaymentDueAmount,
        "payment_rec_date": payment.PaymentRecDate,
        "payment_rec_amount": payment.PaymentRecAmount,
        "payment_id": payment_id,
        "paid_status": False
    }
    await database.execute(query, values)
    return {"message": "New payment created successfully", "PaymentId": payment_id}


@app.get("/api/search-by-client-id")
async def search_by_client_id(client_id: str = None):
    if client_id == "*":
        query = f"SELECT * FROM {CLIENT_RECORDS_TABLE_NAME}"
        result = await database.fetch_all(query)
    else:
        query = f"""
            SELECT * FROM {CLIENT_RECORDS_TABLE_NAME}
            WHERE ClientId = :client_id
        """
        values = {"client_id": client_id}
        result = await database.fetch_all(query, values=values)

    # Convert each ClientRecord object to a dictionary
    converted_rows = []
    for row in result:
        row_dict = dict(row)  # Convert row to dictionary
        converted_row = {
            key: (value.isoformat() if isinstance(value, date) else
                  float(value) if isinstance(value, Decimal) else
                  value)
            for key, value in row_dict.items()
        }
        converted_rows.append(converted_row)
    ##records = [Loan(**row).model_dump() for row in result]
    return JSONResponse(content={"results": converted_rows}, status_code=200)

@app.get("/api/search-by-loan-id")
async def search_by_client_id(loan_id: str = None):

    query = f"""
            SELECT * FROM {CLIENT_RECORDS_TABLE_NAME}
            WHERE LoanId = :loan_id
        """
    values = {"loan_id": loan_id}
    result = await database.fetch_all(query, values=values)

    # Convert each ClientRecord object to a dictionary
    converted_rows = []
    for row in result:
        row_dict = dict(row)  # Convert row to dictionary
        converted_row = {
            key: (value.isoformat() if isinstance(value, date) else
                  float(value) if isinstance(value, Decimal) else
                  value)
            for key, value in row_dict.items()
        }
        converted_rows.append(converted_row)
    return JSONResponse(content={"results": converted_rows}, status_code=200)


@app.get("/api/search-payments-by-loan-id")
async def search_payments_by_client_id(loan_id: str = None):
    query = f"""
            SELECT * FROM {PAYMENT_TABLE_NAME}
            WHERE LoanId = :loan_id
        """
    values = {"loan_id": loan_id}
    result = await database.fetch_all(query, values=values)

    # Convert each ClientRecord object to a dictionary
    converted_rows = []
    for row in result:
        row_dict = dict(row)  # Convert row to dictionary
        converted_row = {
            key: (value.isoformat() if isinstance(value, date) else
                  float(value) if isinstance(value, Decimal) else
                  value)
            for key, value in row_dict.items()
        }
        converted_rows.append(converted_row)
    return JSONResponse(content={"results": converted_rows}, status_code=200)

@app.put("/api/active-status")
async def update_record(record: UpdateLoan, loan_id: str = Query(...)):
    query = f"""
    UPDATE {CLIENT_RECORDS_TABLE_NAME}
    SET ActiveStatus = :ActiveStatus
    WHERE LoanId = :loan_id
    """

    values = {
        "loan_id": loan_id,
        "ActiveStatus": record.ActiveStatus,
    }

    await database.execute(query, values)
    return JSONResponse(content={"message": "Record updated successfully"}, status_code=200)

@app.get("/api/get_upcoming_payments")
async def get_all_upcoming_payments(month: str = Query(...), year: str = Query(...)):
    query = f"""
        SELECT {PAYMENT_TABLE_NAME}.*, {CLIENT_RECORDS_TABLE_NAME}.ClientName FROM {PAYMENT_TABLE_NAME}
        JOIN {CLIENT_RECORDS_TABLE_NAME} ON {PAYMENT_TABLE_NAME}.LoanId = {CLIENT_RECORDS_TABLE_NAME}.LoanId
        WHERE (PaymentRecAmount < PaymentDueAmount OR PaymentRecAmount IS NULL) AND MONTH(PaymentDueDate) = :month AND YEAR(PaymentDueDate) = :year;
    """
    values = {"month": month, "year": year}
    result = await database.fetch_all(query, values=values)

    converted_rows = []
    for row in result:
        row_dict = dict(row)  # Convert row to dictionary
        converted_row = {
            key: (value.isoformat() if isinstance(value, date) else
                  float(value) if isinstance(value, Decimal) else
                  value)
            for key, value in row_dict.items()
        }
        converted_rows.append(converted_row)
    return JSONResponse(content={"results": converted_rows}, status_code=200)

async def get_payment_by_paymentid(payment_id: str):
    query = f"""
        SELECT * FROM {PAYMENT_TABLE_NAME}
        WHERE PaymentId = :payment_id"""
    values = {"payment_id": payment_id}
    result = await database.fetch_all(query, values=values)
    converted_rows = []
    for row in result:
        row_dict = dict(row)
        converted_row = {
            key: value
            for key, value in row_dict.items()
        }
        converted_rows.append(converted_row)
        return converted_rows[0]

@app.put("/api/update-payment-status")
async def update_payment_status(payment_id: str = Query(...), paid_staus: bool = Query(...)):
    record = await get_payment_by_paymentid(payment_id)
    if record["PaidStatus"] == paid_staus:
        return JSONResponse(content={"message": "Payment Status is already updated"}, status_code=200)
    elif record["PaidStatus"]:
        return JSONResponse(content={"message": "Payment Status can not be changed after closed"}, status_code=200)
    query = f"""
        UPDATE {PAYMENT_TABLE_NAME}
        SET PaidStatus = :paid_status
        WHERE PaymentId = :payment_id
        """

    values = {
        "payment_id": payment_id,
        "paid_status": paid_staus
    }

    await database.execute(query, values)
    loan = await search_by_client_id(record["LoanId"])
    loan = json.loads(loan.body)
    loan = loan["results"][0]
    issue_date = datetime.strptime(loan["IssueDate"], '%Y-%m-%d').date()
    loan_maturity = datetime.strptime(loan["LoanMaturity"], '%Y-%m-%d').date()

    total_days = (loan_maturity - issue_date).days

    if loan["PaymentFrequency"] == "Monthly":
        new_due_date = record["PaymentDueDate"] + timedelta(days=30)
        new_due_date = min(new_due_date, loan_maturity)
        amtpayments = total_days // 30

    elif loan["PaymentFrequency"] == "Quarterly":
        new_due_date = record["PaymentDueDate"] + timedelta(days=90)
        new_due_date = min(new_due_date, loan_maturity)
        amtpayments = total_days // 90

    elif loan["PaymentFrequency"] == "Annually":
        new_due_date = datetime(record["PaymentDueDate"].year + 1, record["PaymentDueDate"].month,
                                record["PaymentDueDate"].day)
        new_due_date = min(new_due_date, loan_maturity)
        amtpayments = total_days // 365

    new_payment = NewPayment(
        LoanId=record["LoanId"],
        PaymentDueDate=new_due_date,
        PaymentDueAmount=(loan["LoanAmount"] * (loan["InterestRate"] * .01)) / amtpayments
    )
    if new_due_date == loan_maturity:
        principal_payment = NewPayment(
            LoanId=record["LoanId"],
            PaymentDueDate=loan_maturity,
            PaymentDueAmount=loan["LoanAmount"]
        )
        await create_new_payment(principal_payment)
    await create_new_payment(new_payment)
    return JSONResponse(content={"message": "Record updated successfully"}, status_code=200)


@app.put("/api/update-payment")
async def update_payment(record: Payment, payment_id: str = Query(...)):
    paid_status = record.PaidStatus
    await update_payment_status(payment_id, paid_status)
    # if record.PaymentRecAmount is not None and record.PaymentRecAmount >= record.PaymentDueAmount and not paid_status:
    #     query = f"""
    #     UPDATE {PAYMENT_TABLE_NAME}
    #     SET PaymentRecDate = :PaymentRecDate,
    #         PaymentRecAmount = :PaymentRecAmount,
    #         PaidStatus = true
    #     WHERE PaymentId = :payment_id
    #     """
    #
    #     values = {
    #         "PaymentRecDate": record.PaymentRecDate,
    #         "PaymentRecAmount": record.PaymentRecAmount,
    #         "payment_id": payment_id
    #     }
    #
    #     await database.execute(query, values)
    #     return JSONResponse(content={"message": "Record updated successfully"}, status_code=200)
    # else:
    query = f"""
                    UPDATE {PAYMENT_TABLE_NAME}
                    SET PaymentRecDate = :PaymentRecDate,
                        PaymentRecAmount = :PaymentRecAmount
                    WHERE PaymentId = :payment_id
                    """

    values = {
            "PaymentRecDate": record.PaymentRecDate,
            "PaymentRecAmount": record.PaymentRecAmount,
            "payment_id": payment_id
        }

    await database.execute(query, values)
    return JSONResponse(content={"message": "Record updated successfully"}, status_code=200)
async def create_tables():
    query = f"""
    CREATE DATABASE IF NOT EXISTS {DATABASE_NAME};

    CREATE TABLE IF NOT EXISTS {CLIENT_TABLE_NAME} (
        ClientId VARCHAR(50) NOT NULL PRIMARY KEY,
        ClientName VARCHAR(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS {CLIENT_RECORDS_TABLE_NAME} (
        LoanId VARCHAR(50) NOT NULL PRIMARY KEY,
        ClientId VARCHAR(50) NOT NULL,
        LoanAmount DECIMAL(10, 2) NOT NULL,
        ActiveStatus BOOLEAN NOT NULL,
        ClientName VARCHAR(50) NOT NULL,
        LoanMaturity DATE NOT NULL,
        PaymentFrequency VARCHAR(50) NOT NULL,
        InterestRate DECIMAL(10, 4) NOT NULL,
        IssueDate DATE NOT NULL,
        FOREIGN KEY (ClientId) REFERENCES {CLIENT_TABLE_NAME}(ClientId)
    );

    CREATE TABLE IF NOT EXISTS {PAYMENT_TABLE_NAME} (
        LoanId VARCHAR(50) NOT NULL,
        PaymentDueDate DATE NOT NULL,
        PaymentDueAmount DECIMAL(10, 2) NOT NULL,
        PaymentRecDate DATE,
        PaymentRecAmount DECIMAL(10, 2),
        PaidStatus BOOLEAN NOT NULL,
        PaymentId VARCHAR(50) NOT NULL PRIMARY KEY,
        FOREIGN KEY (LoanId) REFERENCES {CLIENT_RECORDS_TABLE_NAME}(LoanId));
    """
    await database.execute(query)


@app.on_event("startup")
async def startup():
    await database.connect()
    await create_tables()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


@app.get("/heartbeat")
async def heartbeat():
    return JSONResponse(content={"success": True}, status_code=200)