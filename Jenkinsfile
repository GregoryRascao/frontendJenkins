pipeline {
    agent any

    environment {
        SSH_SERVER = credentials('ssh-server')
        SSH_KEY_CREDENTIALS_ID = 'prod-server-key'
        DEPLOY_PATH = credentials('deployment-prod')
    }

    stages {
        stage("Build container") {
            steps {
                // !!!! Attention !!!! : Assurez-vous que :
                // 1. Docker est installé et configuré sur votre machine Jenkins.
                // 2. Votre Jenkins a les permissions nécessaires pour exécuter des commandes Docker.
                sh 'docker --version'
                // On supprime l'image existante pour éviter les conflits.
                sh 'docker image rm -f front || true'
                sh 'docker build -t front .'
                // Exporter l'image
                sh 'docker save front -o ./front.tar'
            }
        }

        stage('Deploy SSH') {
            steps {
               sshagent([env.SSH_KEY_CREDENTIALS_ID]) {
                    sh '''
                        scp ./front.tar $SSH_SERVER:$DEPLOY_PATH/
                        ssh $SSH_SERVER "
                            cd $DEPLOY_PATH
                            docker load -i front.tar
                            docker compose stop front || true
                            docker compose rm front || true
                            docker compose up front -d
                        "
                    '''
               }
            }
        }

        stage('Clean up') {
            steps {
                // Nettoyer les fichiers temporaires
                sh 'rm -f ./front.tar'
                sh 'docker image rm -f front || true'
            }
        }
    }
}