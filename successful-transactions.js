// Load successful transactions
function loadSuccessfulTransactions() {
    // Show loading spinner
    document.getElementById('successful-transactions-body').innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading transactions...</p>
            </td>
        </tr>
    `;
    
    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();
    
    fetch(`order_operations.php?action=get_delivered_orders&_=${timestamp}`)
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Data received:', data);
        if (data.success) {
            renderTransactions(data.orders);
            updateTransactionStats(data.stats);
        } else {
            console.error('Error from server:', data.message);
            showAlert('danger', 'Failed to load transactions: ' + data.message);
            document.getElementById('successful-transactions-body').innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="text-danger">
                            <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                            <p>Error loading transactions: ${data.message}</p>
                            <button class="btn btn-sm btn-outline-primary mt-2" onclick="loadSuccessfulTransactions()">
                                Try Again
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    })
    .catch(error => {
        console.error('Error loading transactions:', error);
        showAlert('danger', 'Error loading transactions. Please try again.');
        document.getElementById('successful-transactions-body').innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="text-danger">
                        <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                        <p>Error loading transactions: ${error.message}</p>
                        <button class="btn btn-sm btn-outline-primary mt-2" onclick="loadSuccessfulTransactions()">
                            Try Again
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}