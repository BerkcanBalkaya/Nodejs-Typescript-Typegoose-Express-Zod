pipeline{
    agent any
    stages {
        stage("build"){
            steps{
                // Buraya npm install tarzı komutlar
                echo "Uygulama oluşturuluyor"
            }
        }
        stage("test"){
            steps{
                // test scriptleri
                sh "npx jest --silence=false --watchAll --setupFiles dotenv/config"
                echo "Uygulama test ediliyor"
            }
        }
        stage("deploy"){
            steps{
                // Yükleme scriptleri
                echo "Uygulama yükleniyor"
            }
        }
    }
}