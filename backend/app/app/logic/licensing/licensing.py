import subprocess
import logging

logger = logging.getLogger(__name__)

class Licensing:
    def __init__(self):
        self.VALIDATOR_PATH="/app/logic/licensing/licval"

    def __run_validate_details(self, filepath: str):
        cmd = f"{self.VALIDATOR_PATH} -file {filepath}"
        res = subprocess.run(cmd, stdout=subprocess.PIPE)
        lic_out = res.stdout.decode('utf-8')
        logger.info(f"Output of license validator: {lic_out}")
        return lic_out


    def check(self, filepath: str):
        lic = self.__run_validate_details(filepath)
        
