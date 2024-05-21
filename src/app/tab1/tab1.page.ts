import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  weatherData: any;
  searchCity: string = '';
  isSearching: boolean = false;
  geolocationAllowed: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.requestGeolocation();
  }

  requestGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          if (!this.isSearching) {
            this.getWeatherByCoordinates(lat, lon);
            this.geolocationAllowed = true;
          }
        },
        error => {
          console.error('Erro ao obter a localização:', error);
          alert('Erro ao obter a localização. Por favor, verifique se as permissões estão habilitadas.');
        }
      );
    } else {
      alert('Geolocalização não é suportada pelo seu navegador.');
    }
  }

  getWeatherByCoordinates(lat: number, lon: number) {
    const apiKey = 'b44d570a8769007984fe5a5c92c3e9c6';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    this.http.get(apiUrl).subscribe(
      data => {
        if (!this.isSearching) {
          this.weatherData = this.processWeatherData(data);
          console.log(this.weatherData); // Verifique os dados recebidos no console
        }
      },
      error => {
        console.error('Erro ao obter dados do clima:', error);
      }
    );
  }

  searchWeather(city: string) {
    if (!city) {
      return;
    }

    this.isSearching = true;

    const apiKey = 'b44d570a8769007984fe5a5c92c3e9c6';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    this.http.get(apiUrl).subscribe(
      data => {
        this.weatherData = this.processWeatherData(data);
        this.isSearching = false;
        this.geolocationAllowed = false; // Reset geolocation flag
        console.log(this.weatherData); // Verifique os dados recebidos no console
      },
      error => {
        console.error('Erro ao buscar dados do clima:', error);
        this.isSearching = false;
      }
    );
  }

  processWeatherData(data: any) {
    return {
      ...data,
      main: {
        ...data.main,
        temp: Math.round(data.main.temp),
        temp_min: Math.round(data.main.temp_min),
        temp_max: Math.round(data.main.temp_max)
      },
      wind: {
        ...data.wind,
        speed: Math.round(data.wind.speed * 3.6) // Converte m/s para km/h
      },
      weather: data.weather.map((item: any) => ({
        ...item,
        description: this.translateWeatherDescription(item.description)
      }))
    };
  }

  getWeatherIcon(iconCode: string) {
    return `https://openweathermap.org/img/wn/${iconCode}.png`;
  }

  translateWeatherDescription(description: string) {
    const translations: Record<string, string> = {
      'clear sky': 'céu limpo',
      'few clouds': 'poucas nuvens',
      'scattered clouds': 'nuvens dispersas',
      'broken clouds': 'nuvens quebradas',
      'shower rain': 'chuva de banho',
      'rain': 'chuva',
      'thunderstorm': 'trovoada',
      'snow': 'neve',
      'mist': 'névoa'
    };
    return translations[description.toLowerCase()] || description;
  }

  isGoodWeatherForFlying() {
    if (!this.weatherData) return false;
    const windSpeed = this.weatherData.wind.speed;
    const weatherCondition = this.weatherData.weather[0].main.toLowerCase();
    return windSpeed <= 10 && weatherCondition !== 'rain';
  }
}
