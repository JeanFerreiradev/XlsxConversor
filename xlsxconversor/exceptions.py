class ResourceNotFoundException(Exception):
    def __init__(self, message, status_code=404, detail=None):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(message)

class InternalServerErrorException(Exception):
    def __init__(self, message, status_code=500, detail=None):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(message)
        
class ResourceUnauthorizedException(Exception):
    def __init__(self, message, status_code=401, detail=None):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(message)

