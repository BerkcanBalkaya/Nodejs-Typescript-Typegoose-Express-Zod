pipeline{
    agent any
    stages {
        stage("build"){
            steps{
                // Buraya npm install tarzÄ± komutlar
                sh "node -v"
                sh "npm install"
                echo "Uygulama olusturuluyor"
            }
        }
        stage("test"){
            steps{
                // test scriptleri
                sh "npx jest --silence=false --setupFiles dotenv/config"
                echo "Uygulama test ediliyor"
            }
        }
        stage("deploy"){
            steps{
                // YÃ¼kleme scriptleri
                echo "Uygulama yukleniyor"
            }
        }
    }
}