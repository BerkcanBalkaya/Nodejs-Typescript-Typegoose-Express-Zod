pipeline{
    agent any
    stages {
        stage("build"){
            steps{
                sh "npm install"
                echo "Uygulama olusturuluyor"
            }
        }
        stage("vulnerability check"){
            steps{
                sh "npm audit"
            }
        }
        stage("sonarqube scanner"){
            steps{
                withSonarQubeEnv(installationName: 'test1'){
                    sh'sonar-scanner.bat'
                }
            }
        }
        stage("sonarqube quality gate"){
            steps {
                timeout(time:2, unit:'MINUTES'){
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage("jest tests"){
            steps{
                sh "npx jest --silence=false --setupFiles dotenv/config"
                echo "Uygulama test ediliyor"
            }
        }
        stage("deploy"){
            steps{
                echo "Uygulama yukleniyor"
            }
        }
    }
}