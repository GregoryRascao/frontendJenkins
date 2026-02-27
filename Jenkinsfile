pipeline {
    agent any

    environment {
        SSH_SERVER = credentials('ssh-server')
        SSH_KEY_CREDENTIALS_ID = 'prod-server-key'
        DEPLOY_PATH = credentials('deployment-prod')
    }

    stage('Build container') {
        steps {
            sh 'docker image rm -f deployment-front || true'
            sh "sed -i "s|api: '.*'|api: 'http://api.deployment.local.test.be/'| " src/env/environement.ts"
            sh 'docker build -t deployment-front .'
            sh 'docker save deployment-front -o ./deployment-front.tar'
        }
    }

    stage('Deploy SSH') {
        steps {
            sshagent([env.SSH_KEY_CREDENTIALS_ID]) {
                sh '''
                    scp ./deployment-front.tar $SSH_SERVER:$DEPLOY_PATH/
                    ssh $SSH_SERVER "
                        cd $DEPLOY_PATH
                        docker load -i ./deployment-front.tar
                        docker compose stop front || true
                        docker compose rm front || true
                        docker compose up front -d
                    "
                '''
            }
        }
    }

    stage('Cleaning up') {
        steps {
            sh 'docker image rm -f deployment-front'
            sh 'rm ./deployment-front.tar'
        }
    }
}