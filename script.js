document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('regForm');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const paymentSection = document.getElementById('paymentSection');
    const submitBtn = document.getElementById('submitBtn');
    const transferContent = document.getElementById('transferContent');
    const qrCode = document.getElementById('qrCode');

    // Remove non-numeric characters from phone while typing
    phoneInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // Basic HTML5 validation is handled by the browser for email and required fields.
        // We just need to specifically check the phone number length (must be exactly 10 digits).
        const phoneVal = phoneInput.value;
        if (phoneVal.length !== 10) {
            phoneError.style.display = 'block';
            phoneInput.classList.add('input-error');
            isValid = false;
        } else {
            phoneError.style.display = 'none';
            phoneInput.classList.remove('input-error');
        }

        if (isValid) {
            submitBtn.textContent = 'Đang xử lý...';
            submitBtn.disabled = true;

            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const province = document.getElementById('province').value.trim();
            const jobTitle = document.getElementById('jobTitle').value.trim();
            const painPoints = document.getElementById('painPoints').value.trim();
            
            // Format name to unaccented without spaces for transfer content
            const formattedName = removeAccents(fullName).replace(/\s+/g, '');
            const transferMsg = `${phoneVal}_WS02_${formattedName}`;
            
            // Prepare data for Google Sheet
            const formData = new FormData();
            formData.append('Họ và tên', fullName);
            formData.append('Email', email);
            formData.append('Số điện thoại', phoneVal);
            formData.append('Tỉnh thành', province);
            formData.append('Vị trí công tác', jobTitle);
            formData.append('Khó khăn', painPoints);
            formData.append('Thời gian', new Date().toLocaleString('vi-VN'));

            // THAY THẾ LINK WEB APP CỦA GOOGLE APPS SCRIPT VÀO ĐÂY
            // Xem file Huong_dan_GoogleSheet.txt để biết cách lấy link này.
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyiCSyF7qcXsl_0M7A0YVC4qjh2hy9z5oHlkPqDuD-RidWzrKTHMmtBhvr8bl6AWUko/exec';
            
            // We use mode: 'no-cors' to avoid CORS issues when submitting to Google Script
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: new URLSearchParams(formData)
            }).then(() => {
                // Show success and QR
                transferContent.textContent = transferMsg;
                
                // TẠO MÃ QR ĐỘNG CHUẨN VIETQR
                const bankId = "vietcombank"; // Ngân hàng Vietcombank
                const accountNo = "1110316666"; // Số tài khoản thật của bạn
                const accountName = "NGUYEN THI HUONG"; // Tên chủ tài khoản
                const amount = "199000"; 
                
                qrCode.src = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${amount}&addInfo=${transferMsg}&accountName=${accountName}`;

                form.style.display = 'none';
                paymentSection.classList.remove('hidden');
                paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }).catch(error => {
                console.error('Error!', error.message);
                alert('Có lỗi xảy ra khi gửi dữ liệu. Vui lòng thử lại!');
                submitBtn.textContent = 'Nhận Mã Thanh Toán';
                submitBtn.disabled = false;
            });
        }
    });

    // Helper to remove vietnamese accents
    function removeAccents(str) {
        return str.normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/đ/g, 'd').replace(/Đ/g, 'D');
    }
});
