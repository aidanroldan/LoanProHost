from datetime import date
from typing import Optional

from pydantic import BaseModel


class Client(BaseModel):
    ClientId: str
    ClientName: str


class Loan(BaseModel):
    LoanId: str
    ClientId: str
    LoanMaturity: date
    LoanAmount: float
    InterestRate: float
    ActiveStatus: bool
    PaymentFrequency: str
    ClientName: str
    IssueDate: date



class NewLoan(BaseModel):
    ClientName: str
    PaymentFrequency: str
    LoanMaturity: date
    LoanAmount: float
    InterestRate: float
    ActiveStatus: bool
    IssueDate: date


class UpdateLoan(BaseModel):
    LoanID: Optional[str] = None
    ActiveStatus: bool

class Payment(BaseModel):
    LoanId: str
    PaymentDueDate: date
    PaymentDueAmount: float
    PaymentRecDate: Optional[date] = None
    PaymentRecAmount: Optional[float] = None
    PaymentId: Optional[str] = None
    PaidStatus: bool

class NewPayment(BaseModel):
    LoanId: str
    PaymentDueDate: date
    PaymentDueAmount: float
    PaymentRecDate: Optional[date] = None
    PaymentRecAmount: Optional[float] = None