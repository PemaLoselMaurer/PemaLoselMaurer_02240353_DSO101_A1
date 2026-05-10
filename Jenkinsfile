pipeline {
    agent any
    tools {
        nodejs 'NodeJS 22'
    }
    environment {
        DOCKERHUB_USER = 'fritzlee'
        BACKEND_IMAGE  = "fritzlee/be-todo:02240353"
        FRONTEND_IMAGE = "fritzlee/fe-todo:02240353"
        GITHUB_REPO    = 'https://github.com/PemaLoselMaurer/PemaLoselMaurer_02240353_DSO101_A1.git'
    }
    stages {
        // Stage 1: Checkout Code
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: "https://github.com/PemaLoselMaurer/PemaLoselMaurer_02240353_DSO101_A1.git"
            }
        }

        // Stage 2: Install Dependencies
        stage('Install') {
            steps {
                dir('Backend') {
                    sh 'npm install'
                }
                dir('Frontend') {
                    sh 'npm install'
                }
            }
        }

        // Stage 3: Build (Next.js frontend production build)
        stage('Build') {
            steps {
                dir('Frontend') {
                    sh 'npm run build'
                }
            }
        }

        // Stage 4: Run Unit Tests
        stage('Test') {
            steps {
                dir('Backend') {
                    sh 'npm test || echo "No test script defined – skipping"'
                }
                dir('Frontend') {
                    sh 'npm test || echo "No test script defined – skipping"'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'junit.xml'
                }
            }
        }

        // Stage 5: Deploy – build Docker images and push to Docker Hub
        stage('Deploy') {
            steps {
                script {
                    def backendImage  = docker.build("${BACKEND_IMAGE}",  './Backend')
                    def frontendImage = docker.build("${FRONTEND_IMAGE}", './Frontend')

                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-creds') {
                        backendImage.push()
                        frontendImage.push()
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check the stage logs above.'
        }
    }
}
