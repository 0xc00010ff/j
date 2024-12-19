import { spawn } from 'child_process';

export async function executeCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Split the command into the base command and its arguments
    const [cmd, ...args] = command.split(' ');
    
    const childProcess = spawn(cmd, args, {
      stdio: 'inherit', // This will properly handle interactive processes
      shell: true
    });

    childProcess.on('error', (error) => {
      reject(new Error(`Command execution failed: ${error.message}`));
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
  });
}
