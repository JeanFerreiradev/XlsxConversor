function popularSelectEstados() {
    const estadosSelect = document.getElementById("estado_origem");
    const estados = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    estados.forEach(optionText => {
        const optionElement = document.createElement("option");
        optionElement.value = optionText;
        optionElement.textContent = optionText;
        estadosSelect.appendChild(optionElement);
    });
}

$(document).ready(function () {
    popularSelectEstados();
    const $dropZone = $('#dropZone');
    const $fileInput = $('#arquivo_excel');
    const $fileInfo = $('#fileInfo');
    const $form = $('#uploadForm');
    const $submitBtn = $('#submitBtn');
    const $progressContainer = $('#progressContainer');
    const $cnpjInput = $('#cnpj_empresa');

    // Máscara para CNPJ
    $cnpjInput.on('input', function () {
        let value = this.value.replace(/\D/g, '');
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
        this.value = value;
    });

    // Drag and drop
    $dropZone.on('dragover dragenter', function (e) {
        e.preventDefault();
        $(this).addClass('dragover');
    });

    $dropZone.on('dragleave dragend drop', function (e) {
        e.preventDefault();
        $(this).removeClass('dragover');
    });

    $dropZone.on('drop', function (e) {
        e.preventDefault();
        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            $fileInput[0].files = files;
            handleFileSelect(files[0]);
        }
    });

    // Seleção de arquivo
    $fileInput.on('change', function (e) {
        if (this.files.length > 0) {
            handleFileSelect(this.files[0]);
        }
    });

    // Mostrar informações do arquivo
    function handleFileSelect(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (file.size > maxSize) {
            alert('Arquivo muito grande! Tamanho máximo: 10MB');
            $fileInput.val('');
            return;
        }

        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xls|xlsx)$/i)) {
            alert('Formato de arquivo não suportado! Use .xls ou .xlsx');
            $fileInput.val('');
            return;
        }

        $('#fileName').text(file.name);
        $('#fileSize').text(formatFileSize(file.size));
        $fileInfo.show();
        $dropZone.hide();
    }

    // Remover arquivo
    $('#removeFile').on('click', function () {
        $fileInput.val('');
        $fileInfo.hide();
        $dropZone.show();
    });

    // Submissão do formulário
    $form.on('submit', function (e) {
        e.preventDefault();

        // Validações
        if (!$('#estado_origem').val()) {
            alert('Por favor, selecione o estado de origem.');
            return;
        }

        if (!$fileInput[0].files.length) {
            alert('Por favor, selecione um arquivo Excel.');
            return;
        }

        const formData = new FormData(this);

        // Desabilita botão e mostra progresso
        $submitBtn.prop('disabled', true);
        $progressContainer.show();

        // Simula progresso
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 90) {
                clearInterval(progressInterval);
                progress = 90;
            }
            updateProgress(progress);
        }, 500);

        // Envio via AJAX
        $.ajax({
            url: window.location.href,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                clearInterval(progressInterval);
                updateProgress(100, 'Processamento concluído com sucesso!');

                setTimeout(() => {
                    alert('Arquivo enviado com sucesso!\nID da submissão: ' + response.submissao_id);
                    window.location.href = "";
                }, 1000);
            },
            error: function (xhr) {
                clearInterval(progressInterval);
                let errorMsg = 'Erro no processamento.';

                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }

                updateProgress(0, errorMsg, true);
                $submitBtn.prop('disabled', false);

                setTimeout(() => {
                    $progressContainer.hide();
                }, 3000);
            }
        });
    });

    // Atualizar barra de progresso
    function updateProgress(percent, status = null, isError = false) {
        const $progressBar = $('#progressBar');
        const $progressText = $('#progressText');
        const $progressStatus = $('#progressStatus');

        $progressBar.css('width', percent + '%');
        $progressText.text(Math.round(percent) + '%');

        if (status) {
            $progressStatus.text(status);
        }

        if (isError) {
            $progressBar.removeClass('bg-success').addClass('bg-danger');
            $progressStatus.removeClass('text-muted').addClass('text-danger');
        } else if (percent >= 100) {
            $progressBar.removeClass('progress-bar-animated').addClass('bg-success');
            $progressStatus.removeClass('text-muted').addClass('text-success');
        }
    }

    // Formatar tamanho do arquivo
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
