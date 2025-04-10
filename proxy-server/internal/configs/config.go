package configs

import (
	"fmt"
	"github.com/spf13/viper"
	"strings"
)

type resource struct {
	Name           string `mapstructure:"name"`
	Endpoint       string `mapstructure:"endpoint"`
	Desination_URL string `mapstructure:"desination_url"`
}

type configuration struct {
	Server struct {
		Host string `mapstructure:"host"`
		Port string `mapstructure:"port"`
	} `mapstructure:"server"`
	Static struct {
		Dir string `mapstructure:"dir"`
	} `mapstructure:"static"`
	Resources []resource
}

var Config *configuration

func NewConfiguration() (*configuration, error) {
	viper.AddConfigPath("data")
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(`.`, `_`))
	err := viper.ReadInConfig()
	if err != nil {
		return nil, fmt.Errorf("error loading config file: %s", err)
	}
	err = viper.Unmarshal(&Config)
	if err != nil {
		return nil, fmt.Errorf("error reading config file: %s", err)
	}
	fmt.Printf("Config loaded: %s", Config)
	return Config, nil
}
