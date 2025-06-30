import React from 'react';

const VerifyEmailSuccessPage: React.FC = () => (
  <div className="verify-email-page">
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-center">Почта подтверждена!</h3>
            </div>
            <div className="card-body text-center">
              <i className="bi bi-check-circle text-success" style={{fontSize: '3rem'}}></i>
              <h4 className="text-success mt-3">Спасибо за подтверждение почты!</h4>
              <a href="/login" className="btn btn-primary mt-3">Войти</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default VerifyEmailSuccessPage; 