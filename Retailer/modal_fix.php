<?php
// This file contains functions to help with modal display issues

/**
 * Function to safely show a Bootstrap modal
 * @param string $modalId The ID of the modal to show
 * @return void
 */
function showModal($modalId) {
    echo "<script>
    document.addEventListener('DOMContentLoaded', function() {
        try {
            var modalElement = document.getElementById('$modalId');
            if (modalElement) {
                var modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        } catch (error) {
            console.error('Error showing modal:', error);
            // Fallback method
            var modalElement = document.getElementById('$modalId');
            if (modalElement) {
                modalElement.classList.add('show');
                modalElement.style.display = 'block';
                document.body.classList.add('modal-open');
            }
        }
    });
    </script>";
}

/**
 * Function to safely hide a Bootstrap modal
 * @param string $modalId The ID of the modal to hide
 * @return void
 */
function hideModal($modalId) {
    echo "<script>
    try {
        var modalElement = document.getElementById('$modalId');
        if (modalElement) {
            var modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            } else {
                // Fallback method
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                document.body.classList.remove('modal-open');
                var backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
            }
        }
    } catch (error) {
        console.error('Error hiding modal:', error);
        // Fallback method
        var modalElement = document.getElementById('$modalId');
        if (modalElement) {
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            document.body.classList.remove('modal-open');
            var backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        }
    }
    </script>";
}
?>
